const AppError = require("./AppError");

class NumberPlateError extends AppError {
    static NameExists() {
        return new NumberPlateError("Biển số xe này đã tồn tại.", 409, "NUMBER_PLATE_NAME_EXISTS");
    }

    static IdNotFound() {
        return new NumberPlateError("Không tìm thấy đơn đăng ký biển số.", 404, "NUMBER_PLATE_NOT_FOUND");
    }

    static PlateNotMatch() {
        return new NumberPlateError("Biển số xe không khớp với ảnh.", 400, "NUMBER_PLATE_NOT_MATCH");
    }

    static RecognizeNotMatch() {
        return new NumberPlateError("Không tìm thấy biển số xe phù hợp với sinh viên.", 404, "NUMBER_PLATE_RECOGNIZE_NOT_MATCH");
    }
    
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = NumberPlateError;