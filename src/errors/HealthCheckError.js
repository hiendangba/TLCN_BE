const AppError = require("./AppError");

class HealthCheckError extends AppError {
    // 🔹 Khi tạo đợt khám mà đã có đợt trùng thời gian trong cùng tòa nhà
    static AlreadyExistsInPeriod() {
        return new HealthCheckError(
            "Đã có đợt khám đã tồn tại trong khoảng thời gian này.",
            409, // 409 Conflict là mã HTTP chuẩn cho lỗi trùng dữ liệu
            "HEALTH_CHECK_ALREADY_EXISTS_IN_PERIOD"
        );
    }

    static RegistrationLimitReached() {
        return new HealthCheckError(
            "Số lượng đăng ký đợt khám đã đầy.",
            409, // 409 Conflict — trùng hoặc vượt giới hạn
            "HEALTH_CHECK_REGISTRATION_LIMIT_REACHED"
        );
    }

    static RegistrationDueReached() {
        return new HealthCheckError(
            "Thời gian đăng ký đã hết hoặc chưa đến.",
            409, // 409 Conflict — trùng hoặc vượt giới hạn
            "HEALTH_CHECK_REGISTRATION_ DUE_REACHED"
        );
    }

    static NotFound() {
        return new HealthCheckError(
            "Đợt khám không tồn tại.",
            404, // 404 Not Found — tài nguyên không tồn tại
            "HEALTH_CHECK_NOT_FOUND"
        );
    }

    static AlreadyRegistered() {
        return new HealthCheckError(
            "User đã đăng ký đợt khám này.",
            409, // 409 Conflict — xung đột dữ liệu
            "HEALTH_CHECK_ALREADY_REGISTERED"
        );
    }
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = HealthCheckError;