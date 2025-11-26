const AppError = require("./AppError");

class RoomError extends AppError {
    static FloorNotFound() {
        return new RoomError("Floor not found", 404, "FLOOR_NOT_FOUND");
    }
    static RoomTypeNotFound() {
        return new RoomError("Loại phòng không tồn tại", 404, "ROOM_TYPE_NOT_FOUND");
    }
    static RoomNumberExistsInFloor() {
        return new RoomError("Room number already exists on this floor", 400, "ROOM_NUMBER_EXISTS_IN_FLOOR");
    }
    static RoomSlotNotFound() {
        return new RoomError("Room slot not found", 404, "ROOM_SLOT_NOT_FOUND");
    }
    static RoomSlotIsOccupied() {
        return new RoomError("Chỗ ở này đã có người đăng ký.", 409, "ROOM_SLOT_OCCUPIED");
    }
    static InvalidUpdateRoom() {
        return new RoomError(
            "Phòng cần chỉnh sửa không tồn tại",
            404,
            "ROOM_NOT_FOUND"
        );
    }
    static InvalidDeleteRoom() {
        return new RoomError(
            "Phòng cần xóa không tồn tại",
            404,
            "ROOM_NOT_FOUND"
        );
    }
    static RoomOccupied() {
        return new RoomError(
            "Phòng đang có sinh viên, không thể chỉnh sửa hoặc xóa",
            409, // 409 Conflict
            "ROOM_OCCUPIED"
        );
    }
    static InvalidRoomType() {
        return new RoomError(
            "Tòa hiện tại không kinh doanh loại phòng này.",
            401, // 409 Conflict
            "InvalidRoomType"
        );
    }
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = RoomError;