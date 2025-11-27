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

    static RoomRegistrationAlreadyApproved() {
        return new RoomRegistrationError("Đơn hủy phòng của bạn đã được duyệt.", 400, "ROOM_REGISTRATION_ALREADY_APPROVED");
    }

    static RoomMoveAlreadyRequested() {
        return new RoomRegistrationError("Đơn chuyển phòng của bạn đang được admin xem xét để duyệt.", 400, "ROOM_MOVE_ALREADY_REQUESTED");
    }

    static RoomExtendAlreadyRequested() {
        return new RoomRegistrationError("Đơn gia hạn phòng đang chờ xử lý.", 400, "ROOM_EXTEND_PENDING");
    }

    static InvalidMoveRequest() {
        return new RoomRegistrationError("Chỉ những đơn đang ở trạng thái CONFIRMED mới được phép yêu cầu chuyển phòng.", 400, "INVALID_MOVE_REQUEST");
    }

    static InvalidExtendRequest() {
        return new RoomRegistrationError("Chỉ có đăng ký phòng đã được xác nhận mới có thể gia hạn.", 400, "INVALID_EXTEND_REQUEST");
    }

    static ExtendTooLate() {
        return new RoomRegistrationError("Không thể gia hạn phòng: hợp đồng đã quá hạn. Hay gặp quản trị viên để giải quyết!", 400, "EXTEND_TOO_LATE");
    }

    static RoomExtendNotFound() {
        return new RoomRegistrationError("Không tìm thấy đơn gia hạn nào cần duyệt.", 404, "ROOM_EXTEND_NOT_FOUND");
    }

    static RoomMoveNotFound() {
        return new RoomRegistrationError("Không tìm thấy đơn chuyển phòng nào cần duyệt.", 404, "ROOM_MOVE_NOT_FOUND");
    }

    static NewRegistrationNotFound() {
        return new RoomRegistrationError("Yêu cầu chuyển phòng mới không tồn tại", 404, "NewRegistrationNotFound");
    }

    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = RoomRegistrationError;
