const AppError = require("./AppError");

class NumberPlateError extends AppError {
    static NameExists() {
        return new NumberPlateError("Biển số xe này đã tồn tại.", 409, "NUMBER_PLATE_NAME_EXISTS");
    }

    static IdNotFound() {
        return new NumberPlateError("Không tìm thấy đơn đăng ký biển số.", 404, "NUMBER_PLATE_NOT_FOUND");
    }

    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = NumberPlateError;