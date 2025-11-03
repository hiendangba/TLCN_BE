const AppError = require("./AppError");

class AuthError extends AppError {
    static AuthenticationFailed() {
        return new AuthError("Tên đăng nhập hoặc mật khẩu không chính xác", 401, "AUTHENTICATION_FAILED");
    }
    static NO_TOKEN() {
        return new AuthError("Không tìm thấy access_token", 401, "NO_TOKEN");
    }
    static InvalidToken() {
        return new AuthError("Access_token không hợp lệ", 401, "INVALID_TOKEN");
    }
    static TokenExpired() {
        return new AuthError("Access_token đã hết hạn", 401, "TOKEN_EXPIRED");
    }
    static NotApproved() {
        return new AuthError("Tài khoản bạn chưa được admin chấp nhận", 403, "NOT_APPROVED")
    }
    static IsAdmin() {
        return new AuthError("Bạn phải là admin", 403, "NOT_ADMIN")
    }
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = AuthError;