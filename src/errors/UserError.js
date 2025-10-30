const AppError = require("./AppError");

class UserError extends AppError {
    // 🧑‍💻 Người dùng đã tồn tại (email hoặc CCCD trùng)
    static UserAlreadyExists() {
        return new UserError("Người dùng đã tồn tại trong hệ thống", 409, "USER_ALREADY_EXISTS");
    }

    // 📷 Ảnh tải lên không hợp lệ
    static InvalidImageFormat() {
        return new UserError("Ảnh tải lên không đúng định dạng cho phép (jpg, png, jpeg, webp)", 400, "INVALID_IMAGE_FORMAT");
    }

    static NoImageUpload() {
        return new UserError("Không có ảnh tải lên", 400, "INVALID_IMAGE_UPLOAD");
    }

    static EmailExists() {
        return new UserError("Email đã tồn tại", 409, "EMAIL_EXISTS");
    }

    static MSSVExists() {
        return new UserError("MSSV đã tồn tại", 409, "MSSV_EXISTS");
    }

    static PhoneExists() {
        return new UserError("Số điện thoại đã tồn tại", 409, "PHONE_EXISTS");
    }

    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = UserError;
