const PaymentError = require("../errors/PaymentError");
const UserError = require("../errors/UserError");
const {
    Student,
    Payment,
} = require("../models");
const axios = require('axios');
require('dotenv').config();
const crypto = require("crypto");

const generateMomoSignature = (rawSignature) => {
    var signature = crypto.createHmac('sha256', process.env.SECRET_KEY_MOMO)
        .update(rawSignature)
        .digest('hex');

    return signature;
};


const verifyMomoCallbackSignature = (momoData) => {
    const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature
    } = momoData;

    const rawSignature =
        "accessKey=" + process.env.ACCESS_KEY_MOMO +
        "&amount=" + amount +
        "&extraData=" + (extraData || "") +
        "&message=" + message +
        "&orderId=" + orderId +
        "&orderInfo=" + orderInfo +
        "&orderType=" + orderType +
        "&partnerCode=" + partnerCode +
        "&payType=" + payType +
        "&requestId=" + requestId +
        "&responseTime=" + responseTime +
        "&resultCode=" + resultCode +
        "&transId=" + transId;

    const expectedSignature = crypto.createHmac("sha256", process.env.SECRET_KEY_MOMO).update(rawSignature).digest("hex");

    return expectedSignature === signature;
}

const paymentService = {
    getPayment: async (userId, paymentRequest) => {
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
            if (payment.status === "success") {
                throw PaymentError.AlreadyProcessed();
            }

           
            var requestId = partnerCode + new Date().getTime();
            var orderId = `${payment.id}_${Date.now()}_${student.id}`;
            var amount = payment.amount.toString();

            var orderInfo = (`${payment.content}`);
            var redirectUrl = process.env.REDIRECT_URL_MOMO;
            var ipnUrl = process.env.IPN_URL_MOMO;
            var requestType = "captureWallet"
            var extraData = "";

            //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
            var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;
            const signature = generateMomoSignature(rawSignature);

            //json object send to MoMo endpoint
            const requestBody = JSON.stringify({
                partnerCode: partnerCode,
                accessKey: accessKey,
                requestId: requestId,
                amount: amount,
                orderId: orderId,
                orderInfo: orderInfo,
                redirectUrl: redirectUrl,
                ipnUrl: ipnUrl,
                extraData: extraData,
                requestType: requestType,
                signature: signature,
                lang: 'en'
            });

            const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

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
            const isValidSignature = verifyMomoCallbackSignature(momoResponse);
            if (!isValidSignature){
                throw PaymentError.InvalidSignature();
            }
            const {
                orderId,
                resultCode,
                responseTime
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

            if (String(resultCode) === "0") {
                // Cập nhật thông tin thanh toán thành công
                payment.paidAt = new Date(Number(responseTime));
                payment.status = "success";
                payment.studentId = studentId;
                payment
            } else {
                payment.status = "failed";
            }

            await payment.save();
            return payment;
        } catch (err) {
            console.log(err);
            throw (err);
        }
    }

}

module.exports = paymentService;