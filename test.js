const crypto = require("crypto");
require('dotenv').config();

function generateMomoRefundSignature({
    accessKey,
    secretKey,
    amount,
    description,
    orderId,
    partnerCode,
    requestId,
    transId,
}) {
    // Tạo rawSignature theo đúng thứ tự MoMo yêu cầu
    const rawSignature =
        "accessKey=" + accessKey +
        "&amount=" + amount +
        "&description=" + description +
        "&orderId=" + orderId +
        "&partnerCode=" + partnerCode +
        "&requestId=" + requestId +
        "&transId=" + transId;

    // Ký HMAC-SHA256
    const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

    return { rawSignature, signature };
}


const { rawSignature, signature } = generateMomoRefundSignature({
    accessKey: process.env.ACCESS_KEY_MOMO,
    secretKey: process.env.SECRET_KEY_MOMO,

    amount: 10000,
    description: "Hoàn tiền giao dịch",
    orderId: "order_refund_1234567",
    partnerCode: "MOMO",
    requestId: "refund_request_1234567",
    transId: 4613767903,
});

console.log("rawSignature:", rawSignature);
console.log("signature:", signature);