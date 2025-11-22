const AppError = require("./AppError");

class UserError extends AppError {
    static NoImageUpload() {
        return new UserError("Không có ảnh tải lên.", 400, "INVALID_IMAGE_UPLOAD");
    }

    static EmailExists() {
        return new UserError("Email đã tồn tại.", 409, "EMAIL_EXISTS");
    }

    static InvalidUser() {
        return new UserError("User không tồn tại, hoặc không đúng role.", 409, "INVALID_USER");
    }

    static MSSVExists() {
        return new UserError("MSSV đã tồn tại.", 409, "MSSV_EXISTS");
    }

    static IdentificationExists() {
        return new UserError("Số Căn cước công dân đã tồn tại.", 409, "IDENTIFICATION_EXISTS");
    }

    static PhoneExists() {
        return new UserError("Số điện thoại đã tồn tại.", 409, "PHONE_EXISTS");
    }

    static AdminNotFound() {
        return new UserError("Không tìm thấy adminId trong token.", 404, "ADMIN_NOT_FOUND");
    }

    static UserNotFound() {
        return new UserError("Không tìm thấy người dùng với email hoặc số căn cước đã cung cấp.", 404, "USER_NOT_FOUND");
    }

    static InvalidFlowId() {
        return new UserError("Phiên quên mật khẩu hết hạn hoặc không đúng.", 400, "INVALID_FLOW_ID")
    }

    static OtpResendMaxAttempt() {
        return new UserError("Vượt quá số lần gửi lại OTP.", 400, "OTP_RESEND_MAX_ATTEMPTS")
    }

    static OtpMaxAttempt() {
        return new UserError("Vượt quá số lần nhập OTP.", 400, "OTP_MAX_ATTEMPTS")
    }

    static InvalidFlowData() {
        return new UserError("Dữ liệu khôi phục mật khẩu không hợp lệ hoặc đã bị thay đổi.", 400, "INVALID_FLOW_DATA");
    }

    static OtpIncorrect() {
        return new AppError("OTP không chính xác.", 400, "OTP_INCORRECT");
    }

    static NoHaveToken() {
        return new AppError("Không có token, không thể thực hiện hành động.", 400, "NO_HAVE_TOKEN");
    }

    static TokenInvalid() {
        return new AppError("Token không hợp lệ.", 401, "TOKEN_INVALID");
    }

    static TokenExpired() {
        return new AppError("Token đã hết hạn.", 401, "TOKEN_EXPIRED");
    }

    static InvalidResetTokenPurpose() {
        return new AppError("Token không hợp lệ để đặt lại mật khẩu.", 401, "INVALID_RESET_TOKEN_PURPOSE");
    }
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = UserError;
