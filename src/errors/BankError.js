const AppError = require("./AppError");

class BankError extends AppError {
    static NotFound() {
        return new BankError("Ngân hàng không tồn tại.", 404, "BANK_NOT_FOUND");
    }

    static InvalidResponse() {
        return new BankError("Dữ liệu trả về từ API ngân hàng không hợp lệ.", 400, "BANK_INVALID_RESPONSE");
    }

    static ApiError(message) {
        return new BankError(message || "Lỗi từ API ngân hàng.", 500, "BANK_API_ERROR");
    }

    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = BankError;
