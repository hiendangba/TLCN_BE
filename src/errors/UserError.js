const AppError = require("./AppError");

class UserError extends AppError {
    static NoImageUpload() {
        return new UserError("Không có ảnh tải lên", 400, "INVALID_IMAGE_UPLOAD");
    }

    static EmailExists() {
        return new UserError("Email đã tồn tại", 409, "EMAIL_EXISTS");
    }

    static MSSVExists() {
        return new UserError("MSSV đã tồn tại", 409, "MSSV_EXISTS");
    }

    static IdentificationExists() {
        return new UserError("Số Căn cước công dân đã tồn tại", 409, "IDENTIFICATION_EXISTS");
    }

    static PhoneExists() {
        return new UserError("Số điện thoại đã tồn tại", 409, "PHONE_EXISTS");
    }

    static AdminNotFound() {
        return new UserError("Không tìm thấy adminId trong token", 404, "ADMIN_NOT_FOUND");
    }

    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = UserError;
