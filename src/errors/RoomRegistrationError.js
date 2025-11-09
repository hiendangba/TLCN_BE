const AppError = require("./AppError");

class RoomRegistrationError extends AppError {
    static IdNotFound() {
        return new RoomRegistrationError("Không tìm thấy ID tương ứng", 404, "ID_NOT_FOUND");
    }
    static AlreadyApproved() {
        return new RoomRegistrationError("Đơn đăng ký này đã được duyệt trước đó", 400, "ROOM_ALREADY_APPROVED");
    }
    static RoomSlotNotFound() {
        return new RoomRegistrationError("Không tìm thấy vị trí phòng tương ứng", 404, "ROOM_SLOT_NOT_FOUND")
    }
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}
module.exports = RoomRegistrationError;
