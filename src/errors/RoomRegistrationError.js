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
    static RoomRegistrationAlreadyCanceled() {
        return new RoomRegistrationError("Đơn hủy phòng của bạn đang được admin xem xét để duyệt.", 400, "ROOM_REGISTRATION_ALREADY_CANCELED");
    }
    static RoomMoveAlreadyRequested() {
        return new RoomRegistrationError("Đơn chuyển phòng của bạn đang được admin xem xét để duyệt.", 400, "ROOM_MOVE_ALREADY_REQUESTED");
    }
    static InvalidMoveRequest() {
        return new RoomRegistrationError("Chỉ những đơn đang ở trạng thái CONFIRMED mới được phép yêu cầu chuyển phòng.", 400, "INVALID_MOVE_REQUEST");
    }
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}
module.exports = RoomRegistrationError;
