const PaymentError = require("../errors/PaymentError");
const UserError = require("../errors/UserError");
const {
    Student,
    Payment,
    sequelize,
    User,
    RoomRegistration,
    RoomSlot,
    Room,
    Admin,
} = require("../models");
require('dotenv').config();
const momoUtils = require("../utils/momo.util");
const {
    Op,
} = require("sequelize");

const paymentService = {

    getRevenue: async (getRevenueRequest, adminId) => {
        const { userId, type, startDate, endDate } = getRevenueRequest;
        const admin = await Admin.findByPk(adminId);
        if (!admin) throw UserError.AdminNotFound();

        let whereCondition = {};

        if (userId) {
            const student = await Student.findOne({
                where: { 
                    userId: userId
                },
                attributes: ["id"]
            })
            if (!student){ 
                throw UserError.UserNotFound();
            }
            whereCondition.studentId = student.id;
        }

        if (type) { 
            const typeList = ["WATER", "ROOM", "ELECTRICITY", "HEALTHCHECK"];
            if (!typeList.includes(type)) {
                throw PaymentError.invalidServiceType();
            }
            whereCondition.type = {
                [Op.or]: [
                    type,
                    `REFUND_${type}`
                ]
            };
        }

        // Chỉ áp dụng lọc ngày khi có đủ cả startDate và endDate
        if (startDate && endDate) {
            whereCondition.createdAt = {
                [Op.gte]: startDate,
                [Op.lte]: endDate,
            };
        }

        console.log(whereCondition);

        const payments = await Payment.findAll({
            where: whereCondition,
            attributes: ["status", "type", "amount"],
            raw: true
        })

        console.log(payments);

       const result = payments.reduce((acc, item) => {
            const status = String(item.status).toUpperCase();
            const itemType = String(item.type).toUpperCase();

            if (status === "SUCCESS" &&  (itemType === type || (!type && !itemType.includes("REFUND")))) {
                acc.paidTotal += Number(item.amount);
            } else if (status === "PENDING" && (itemType === type || (!type && !itemType.includes("REFUND")))) {
                acc.unpaidTotal += Number(item.amount);
            } else if (status === "SUCCESS" && (itemType === `REFUND_${type}` || itemType.includes("REFUND"))) {
                acc.refundedTotal += Number(item.amount);
            } else if (status === "PENDING" && (itemType === `REFUND_${type}` || itemType.includes("REFUND"))) {
                acc.unrefundedTotal += Number(item.amount);
            }

            return acc;

        }, {
            paidTotal: 0,
            unpaidTotal: 0,
            refundedTotal: 0,
            unrefundedTotal: 0 // phần nay là phần truyền vào á
        });
        
        return result;
        
    },

    getPayment: async (getPaymentRequest, roleId, role, userIdFromToken) => {
        try {
            const {
                page,
                limit,
                keyword,
                userId, // userId from query params (for admin filtering)
                type,
                startDate,
                endDate,
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
                const targetUserId = userId;
                if (targetUserId) {
                    student = await Student.findOne({
                        where: {
                            userId: targetUserId
                        }
                    });
                    if (!student) throw UserError.UserNotFound();
                    searchCondition.studentId = student.id;
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

            
            const dateCondition = (startDate && endDate)
                ? {
                    createdAt: {
                        [Op.gte]: startDate,
                        [Op.lte]: endDate,
                    },
                }
                : {};

            const payments = await Payment.findAndCountAll({
                where: {
                    ...searchCondition,
                    ...dateCondition,
                },
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

            // Calculate statistics: get all payments (without pagination) for statistics
            const allPayments = await Payment.findAll({
                where: {
                    ...searchCondition,
                    ...dateCondition,
                },
                attributes: ['amount', 'status', 'type'],
                raw: true
            });

            console.log('All payments for statistics:', allPayments.length);
            console.log('Sample payment:', allPayments[0]);

            // Calculate statistics with refund subtraction
            const statistics = allPayments.reduce((acc, payment) => {
                const status = String(payment.status || '').toUpperCase().trim();
                const type = String(payment.type || '').toUpperCase().trim();
                const amount = Number(payment.amount) || 0;

                // Check if it's a refund
                const isRefund = type.includes('REFUND');

                if (status === 'SUCCESS') {
                    if (isRefund) {
                        // Refund: subtract from paid amount
                        acc.paidAmount -= amount;
                    } else {
                        // Normal payment: add to paid amount
                        acc.paidAmount += amount;
                    }
                } else if (status === 'PENDING') {
                    if (!isRefund) {
                        // Only count pending non-refund payments as unpaid
                        acc.unpaidAmount += amount;
                    }
                }

                return acc;
            }, {
                totalItems: payments.count,
                paidAmount: 0,
                unpaidAmount: 0
            });

            console.log('Calculated statistics:', statistics);

            return {
                totalItems: payments.count,
                response: payments.rows,
                ...statistics
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