const PaymentError = require("../errors/PaymentError");
const UserError = require("../errors/UserError");
const {
    Student,
    Payment,
} = require("../models");
const axios = require('axios');


const paymentService = {
    getPayment: async (userId, paymentRequest) => {
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
            throw PaymentError.InvalidPayment();
        }
        if (payment.status !== "pending") {
            throw PaymentError.AlreadyProcessed();
        }

        // Goi momo de lay URL den trang thanh toan momo
        var partnerCode = "MOMO";
        var accessKey = "F8BBA842ECF85";
        var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
        var requestId = partnerCode + new Date().getTime();
        var orderId = payment.id;
        var orderInfo = `Content ${payment.content} - studentId: ${student.id}`;
        var redirectUrl = "https://momo.vn/return"; //thay url call back ở đây
        var ipnUrl = "https://callback.url/notify"; //thay url call back o day
        // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
        var amount = payment.amount.toString();
        var requestType = "captureWallet"
        var extraData = ""; //pass empty value if your merchant does not have stores

        //before sign HMAC SHA256 with format
        //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
        var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType
        //puts raw signature
        console.log("--------------------RAW SIGNATURE----------------")
        console.log(rawSignature)
        //signature
        const crypto = require('crypto');
        var signature = crypto.createHmac('sha256', secretkey)
            .update(rawSignature)
            .digest('hex');
        console.log("--------------------SIGNATURE----------------")
        console.log(signature)

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
        console.log("URL: ",response.data.payUrl);
        return response.data.payUrl;
    }
}

module.exports = paymentService;