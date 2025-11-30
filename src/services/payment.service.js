const PaymentError = require("../errors/PaymentError");
const UserError = require("../errors/UserError");
const {
    Student,
    Payment,
    sequelize,
    User,
    RoomRegistration,
    RoomSlot,
    Room
} = require("../models");
require('dotenv').config();
const momoUtils = require("../utils/momo.util");
const {
    Op,
    where
} = require("sequelize");

const paymentService = {

    getPayment: async (getPaymentRequest, roleId, role, userIdFromToken) => {
        try {
            const {
                page,
                limit,
                keyword,
                userId, // userId from query params (for admin filtering)
                type
            } = getPaymentRequest;
            const offset = (page - 1) * limit;

            let searchCondition = {};

            let student = null;

            // Nếu là student -> tự động lấy userId từ token
            if (role === "student") {
                if (!userIdFromToken) throw PaymentError.InvoiceListNotBelongToYou();

                student = await Student.findOne({
                    where: {
                        userId: userIdFromToken
                    }
                });
                if (!student) throw UserError.InvalidUser();

                if (roleId !== student.id) {
                    throw PaymentError.InvoiceListNotBelongToYou();
                }

                // Student chỉ được xem của chính mình
                searchCondition.studentId = student.id;
            }

            // Nếu là admin hoặc role khác -> có userId trong query thì lọc theo đó, không có thì lấy từ token
            else {
                const targetUserId = userId || userIdFromToken;
                if (targetUserId) {
                    student = await Student.findOne({
                        where: {
                            userId: targetUserId
                        }
                    });
                    if (student) searchCondition.studentId = student.id;
                }
            }

            if (keyword) {
                searchCondition[Op.or] = [{
                        content: {
                            [Op.like]: `%${keyword}%`
                        }
                    },
                    {
                        status: {
                            [Op.like]: `%${keyword}%`
                        }
                    },
                    // Tìm theo ngày paidAt
                    sequelize.where(
                        sequelize.fn("DATE_FORMAT", sequelize.col("paidAt"), "%d/%m/%Y"), {
                            [Op.like]: `%${keyword}%`
                        }
                    )
                ];
            }

            if (type) {
                searchCondition.type = {
                    [Op.like]: `%${type}%`
                };
            }

            const payments = await Payment.findAndCountAll({
                where: searchCondition,
                include: [{
                    model: Student,
                    include: [
                        {
                            model: User
                        },
                        {
                            model: RoomRegistration,
                            where: {
                                status: ["CONFIRMED", "MOVE_PENDING", "EXTENDING", "CANCELED"],
                                endDate: {
                                    [Op.gt]: new Date()
                                }
                            },
                            required: false,
                            separate: true,
                            limit: 1,
                            order: [["createdAt", "DESC"]],
                            include: [{
                                model: RoomSlot,
                                required: false,
                                include: [{
                                    model: Room,
                                    required: false,
                                    attributes: ['roomNumber']
                                }]
                            }]
                        }
                    ]
                }],
                offset,
                limit,
                order: [
                    ["createdAt", "DESC"]
                ]
            })

            return {
                totalItems: payments.count,
                response: payments.rows,
            };
        } catch (err) {
            console.log(err);
            throw (err);
        }
    },

    getPaymentUrl: async (userId, paymentRequest) => {
        try {
            const {
                paymentId
            } = paymentRequest;
            // Check user va payment co ton tai khong

            const student = await Student.findOne({
                where: {
                    userId: userId
                }
            });

            if (!student) {
                throw UserError.InvalidUser();
            }

            const payment = await Payment.findByPk(paymentId);
            if (!payment) {
                throw PaymentError.PaymentNotFound();
            }
            if (payment.status === "SUCCESS") {
                throw PaymentError.AlreadyProcessed();
            }


            const {
                body,
                rawSignature
            } = momoUtils.generateMomoRawSignatureGetUrl(payment, student);
            const signature = momoUtils.generateMomoSignature(rawSignature);

            const response = await momoUtils.getPaymentUrl(body, signature);

            if (response.data.payUrl) {
                return response.data.payUrl;
            } else {
                return "";
            }

        } catch (err) {
            console.log(err);
            throw err;
        }
    },

    checkPayment: async (momoResponse) => {
        try {
            const isValidSignature = momoUtils.verifyMomoCallbackSignature(momoResponse);
            if (!isValidSignature) {
                throw PaymentError.InvalidSignature();
            }
            const {
                orderId,
                resultCode,
                responseTime,
                amount
            } = momoResponse;
            const paymentId = orderId.split("_")[0];
            const studentId = orderId.split("_")[2];

            // Tìm payment có trong DB
            const payment = await Payment.findByPk(paymentId);
            if (!payment) {
                // Có thể gọi hàm hoàn tiền ở đây
                throw PaymentError.PaymentNotFound();
            }

            const isSuccessOrUnknown = String(resultCode) === "0" || String(resultCode) === "99";

            if (!isSuccessOrUnknown || Number(amount) !== Number(payment.amount)) {
                payment.status = "FAILED";
                await payment.save();
                // Có thể gọi hàm hoàn tiền ở đây
                throw PaymentError.PaymentFailed();
            }

            payment.paidAt = new Date(Number(responseTime));
            payment.status = "SUCCESS";
            payment.transId = momoResponse.transId;
            await payment.save();

            // Nếu như trạng thái ở đây là electricity or water thì phải lọc để cập nhật lại à
            if (payment.type === "ELECTRICITY" || payment.type === "WATER") {

                await Payment.update({
                    paidAt: new Date(Number(responseTime)),
                    status: "SUCCESS",
                    transId: momoResponse.transId,
                }, {
                    where: {
                        content: payment.content,
                        type: payment.type,
                        status: "PENDING"
                    }
                });
            }

            return payment;

        } catch (err) {
            console.log(err);
            throw (err);
        }
    },

    isPaid: async (studentId) => {
        const payment = await Payment.findOne({
            where: {
                studentId: studentId,
                type: "ROOM",
                status: "SUCCESS"
            },
            order: [
                ['paidAt', 'DESC']
            ]
        });
        return payment !== null;
    },

    getPaymentByStudentId: async (studentId, type) => {
        const payment = await Payment.findOne({
            where: {
                studentId: studentId,
                type: type,
                status: "SUCCESS",
                transId: {
                    [Op.ne]: null,
                    [Op.not]: ""
                }
            },
            order: [
                ['paidAt', 'DESC']
            ]
        });
        return payment;
    },

    hasPendingHealthCheckPayment: async (studentId, type) => {
        const payment = await Payment.findOne({
            where: {
                studentId,
                type: type
            },
            order: [
                ["createdAt", "DESC"] 
            ]
        });

        // Không có payment nào
        if (!payment) return false;

        // Kiểm tra payment mới nhất có trạng thái PENDING hay không
        return payment.status === "PENDING";
    },

    getLastestPayment: async (studentId, type) => {
        const payment = await Payment.findOne({
            where: {
                studentId,
                type: type
            },
            order: [
                ["createdAt", "DESC"] 
            ]
        });

        return payment;
    },

    createPayment: async (paymentList) => {
        const t = await sequelize.transaction();
        try {
            // Nếu đầu vào không phải là mãng, biến thành mãng
            const isSingle = !Array.isArray(paymentList);
            const list = isSingle ? [paymentList] : paymentList;

            const results = await Promise.all(
                list.map(p => {
                    return Payment.create({
                        content: p.content,
                        type: p.type,
                        amount: p.amount,
                        currency: "VND",
                        transactionRef: null,
                        paidAt: null,
                        ...(p.studentId ? {
                            studentId: p.studentId
                        } : {}),
                        status: "PENDING",
                    }, {
                        transaction: t
                    })
                })
            );

            await t.commit();
            return isSingle ? results[0] : results;
        } catch (err) {
            console.log(err);
            await t.rollback();
            throw err;
        }

    }

}

module.exports = paymentService;