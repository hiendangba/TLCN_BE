const AppError = require("./AppError");

class RenewalError extends AppError {
    static AlreadyActive() {
        return new RenewalError("Đã tồn tại gia hạn (Renewal) đang hoạt động.", 400, "RENEWAL_ACTIVE");
    }
    static NotFoundActive() {
        return new RenewalError("Không tìm thấy gia hạn (Renewal) đang hoạt động.", 404, "RENEWAL_NOT_FOUND_ACTIVE");
    }
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = RenewalError;