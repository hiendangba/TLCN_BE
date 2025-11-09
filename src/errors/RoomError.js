const AppError = require("./AppError");

class RoomError extends AppError {
    static FloorNotFound() {
        return new RoomError("Floor not found", 404, "FLOOR_NOT_FOUND");
    }
    static RoomTypeNotFound() {
        return new RoomError("Room type not found", 404, "ROOM_TYPE_NOT_FOUND");
    }
    static RoomNumberExistsInFloor() {
        return new RoomError("Room number already exists on this floor", 400, "ROOM_NUMBER_EXISTS_IN_FLOOR");
    }
    static RoomSlotNotFound() {
        return new RoomError("Room slot not found", 404, "ROOM_SLOT_NOT_FOUND");
    }
    static RoomSlotIsOccupied() {
        return new RoomError("Chỗ ở này đã có người đăng ký", 409, "ROOM_SLOT_OCCUPIED");
    }
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = RoomError;