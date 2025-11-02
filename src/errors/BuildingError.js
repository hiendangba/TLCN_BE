const AppError = require("./AppError");

class BuildingError extends AppError {
    static NameExists() {
        return new BuildingError("Tên tòa nhà đã tồn tại", 409, "BUILDING_NAME_EXISTS");
    }
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = BuildingError;