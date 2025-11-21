const AppError = require("./AppError");

class RoomRegistrationError extends AppError {
    static RoomSlotNotFound() {
        return new RoomRegistrationError("Không tìm thấy vị trí phòng tương ứng.", 404, "ROOM_SLOT_NOT_FOUND")
    }
    static RoomRegistrationNotFound() {
        return new RoomRegistrationError("Người dùng hiện tại không thuê phòng nào.", 404, "ROOM_REGISTRATION_NOT_FOUND")
    }
    static CheckoutDateAfterEndDate() {
        return new RoomRegistrationError("Ngày checkout không thể sau ngày kết thúc hợp đồng.", 400, "CHECKOUT_AFTER_END_DATE");
    }
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}
module.exports = RoomRegistrationError;
