const AppError = require("./AppError");

class RoomRegistrationError extends AppError {
    static RoomSlotNotFound() {
        return new RoomRegistrationError("Không tìm thấy vị trí phòng tương ứng.", 404, "ROOM_SLOT_NOT_FOUND")
    }
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}
module.exports = RoomRegistrationError;
