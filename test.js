const crypto = require('crypto');

// Giả lập dữ liệu payment & oldPayment
const payment = {
    content: "Hoàn tiền giao dịch đặt phòng ký túc xá",
    amount: 200000
};

const oldPayment = {
    transId: 4620040044
};

// ACCESS_KEY & SECRET_KEY (thay bằng biến môi trường thực tế)
const ACCESS_KEY_MOMO = "F8BBA842ECF85";
const SECRET_KEY_MOMO = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

// Hàm generate rawSignature
function generateMomoRawSignatureRefund(payment, oldPayment) {
    const timestamp = Date.now();
    const bodyMoMo = {
        description: payment.content,
        orderId: `HP_1764503000123`,
        partnerCode: "MOMO",
        requestId: `HP_1764503000123`,
        transId: oldPayment.transId,
        amount: Number(payment.amount),
    };

    const rawSignature =
        "accessKey=" + ACCESS_KEY_MOMO +
        "&amount=" + bodyMoMo.amount +
        "&description=" + bodyMoMo.description +
        "&orderId=" + bodyMoMo.orderId +
        "&partnerCode=" + bodyMoMo.partnerCode +
        "&requestId=" + bodyMoMo.requestId +
        "&transId=" + bodyMoMo.transId;

    return { bodyMoMo, rawSignature };
}

// Hàm generate HMAC-SHA256 signature
function generateMomoSignature(rawSignature) {
    const signature = crypto.createHmac('sha256', SECRET_KEY_MOMO)
        .update(rawSignature)
        .digest('hex');
    return signature;
}

// Thực thi
const { bodyMoMo, rawSignature } = generateMomoRawSignatureRefund(payment, oldPayment);
const signature = generateMomoSignature(rawSignature);

console.log("bodyMoMo:", bodyMoMo);
console.log("rawSignature:", rawSignature);
console.log("signature:", signature);
