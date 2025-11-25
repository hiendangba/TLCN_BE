const PaymentError = require("../errors/PaymentError");
const UserError = require("../errors/UserError");
const {
    Student,
    Payment,
    sequelize,
} = require("../models");
require('dotenv').config();
const momoUtils = require("../utils/momo.util");

const paymentService = {

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

            
            const { body, rawSignature} = momoUtils.generateMomoRawSignatureGetUrl(payment, student);
            const signature = momoUtils.generateMomoSignature(rawSignature);

            const response = await momoUtils.getPaymentUrl(body,signature);

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
                throw PaymentError.PaymentNotFound();
            }

            // Kiểm tra studentId
            const student = await Student.findByPk(studentId);
            if (!student) {
                throw UserError.InvalidUser();
            }

            if (String(resultCode) !== "0" || Number(amount) !== Number(payment.amount)){
                payment.status = "FAILED";
                await payment.save();
                throw PaymentError.PaymentFailed();
            }

            payment.paidAt = new Date(Number(responseTime));
            payment.status = "SUCCESS";
            payment.studentId = studentId;
            payment.transId = momoResponse.transId;
            await payment.save();
            return payment;

        } catch (err) {
            console.log(err);
            throw (err);
        }
    },

    getPaymentByStudentId: async (studentId, type) => {
        const payment = await Payment.findOne({
            where: {
                studentId: studentId,
                type: type,
                status: "success"
            },
            order: [
                ['paidAt', 'DESC']
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