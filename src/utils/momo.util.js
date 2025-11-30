require('dotenv').config();
const axios = require('axios');
const crypto = require("crypto");

const momoUtils = {
    getPaymentUrl: async (body, signature) => {
        try {
            const requestBody = JSON.stringify({
                ...body,
                signature: signature,
                lang: 'en'
            });

            const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            return response;

        } catch (err) {
            console.error('MoMo request failed', err.message);
            throw err;
        }
    },

    getRefund: async (bodyMoMo, signature) => {

        try {
            const body = {
                ...bodyMoMo,
                signature: signature,
                lang: "vi"
            };

            const refundResponse = await axios.post(
                "https://test-payment.momo.vn/v2/gateway/api/refund",
                body, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            return refundResponse;
            
        } catch (err) {
            console.error('MoMo request failed', err.message);
            throw err;
        }
    },

    generateMomoRawSignatureRefund: (payment, oldPayment) => {
        console.log("TRansID khi vào hàm rf", oldPayment.transId);
        const timestamp = Date.now();
        const bodyMoMo = {
            description: payment.content,
            orderId: `HP_${timestamp}`,
            partnerCode: "MOMO",
            requestId: `HP_${timestamp}`,
            transId: oldPayment.transId,
            amount: Number(payment.amount),
        }

        const rawSignature =
            "accessKey=" + process.env.ACCESS_KEY_MOMO +
            "&amount=" + bodyMoMo.amount +
            "&description=" + bodyMoMo.description +
            "&orderId=" + bodyMoMo.orderId +
            "&partnerCode=" + bodyMoMo.partnerCode +
            "&requestId=" + bodyMoMo.requestId +
            "&transId=" + bodyMoMo.transId;

        return {
            bodyMoMo,
            rawSignature
        };
    },


    generateMomoRawSignatureGetUrl: (payment, student) => {
        const timestamp = Date.now();
        const body = {
            partnerCode: "MOMO",
            accessKey: process.env.ACCESS_KEY_MOMO,
            requestId: "MOMO" + timestamp,
            orderId: `${payment.id}_${timestamp}_${student.id}`,
            amount: payment.amount.toString(),
            orderInfo: payment.content.toString(),
            redirectUrl: process.env.REDIRECT_URL_MOMO,
            ipnUrl: process.env.IPN_URL_MOMO,
            requestType: "captureWallet",
            extraData: "",
        };
        const rawSignature = "accessKey=" + body.accessKey + "&amount=" + body.amount + "&extraData=" + body.extraData + "&ipnUrl=" + body.ipnUrl + "&orderId=" + body.orderId + "&orderInfo=" + body.orderInfo + "&partnerCode=" + body.partnerCode + "&redirectUrl=" + body.redirectUrl + "&requestId=" + body.requestId + "&requestType=" + body.requestType;
        return {
            body,
            rawSignature
        };
    },

    generateMomoSignature: (rawSignature) => {
        var signature = crypto.createHmac('sha256', process.env.SECRET_KEY_MOMO)
            .update(rawSignature)
            .digest('hex');

        return signature;
    },

    verifyMomoCallbackSignature: (momoData) => {
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
    },
};


module.exports = momoUtils;