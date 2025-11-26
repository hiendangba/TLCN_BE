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
    static BuildingHasOccupiedSlots() {
        return new BuildingError("Không thể xóa tòa nhà vì có các vị trí phòng đang được thuê.", 400, "BUILDING_HAS_OCCUPIED_SLOTS");
    }
    static BuildingHasRooms() {
        return new BuildingError("Không thể chỉnh nhà vì tòa nhà có phòng.", 400, "BUILDING_HAS_ROOMS");
    }
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = BuildingError;