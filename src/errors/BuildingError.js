const AppError = require("./AppError");

class BuildingError extends AppError {
    static NameExists() {
        return new BuildingError("Tên tòa nhà đã tồn tại.", 409, "BUILDING_NAME_EXISTS");
    }
    static NotFound() {
        return new BuildingError("Tòa nhà không tồn tại.", 404, "BUILDING_NOT_FOUND");
    }
    static RoomTypeNotFound() {
        return new AppError("Không tìm thấy loại phòng tương ứng.", 404, "ROOM_TYPES_NOT_FOUND");
    }

    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = BuildingError;