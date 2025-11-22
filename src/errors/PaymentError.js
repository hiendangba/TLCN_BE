const AppError = require("./AppError");

class PaymentError extends AppError {
    static PaymentNotFound() {
        return new PaymentError("Hóa đơn không tồn tại.", 400, "Payment_Not_Found");
    };

    static AlreadyProcessed() {
        return new PaymentError("Giao dịch này đã được xử lý trước đó.", 409, "PAYMENT_ALREADY_PROCESSED");
    };

    static InvalidSignature() {
        return new PaymentError("Chữ ký không hợp lệ.", 401, "InvalidSignature");
    };

    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = PaymentError;