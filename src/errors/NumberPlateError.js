const AppError = require("./AppError");

class NumberPlateError extends AppError {
    static NameExists() {
        return new NumberPlateError("Biển số xe này đã tồn tại", 409, "NUMBER_PLATE_NAME_EXISTS");
    }

    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = NumberPlateError;