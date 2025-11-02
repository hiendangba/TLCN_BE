const AppError = require("../errors/AppError");

// Middleware xử lý lỗi trung tâm
const errorMiddleware = (err, req, res, next) => {
    // Nếu là lỗi AppError do ta tự định nghĩa
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode || null,
        });
    }

    // Nếu là lỗi từ validation (ví dụ Joi, Zod, hoặc DTO)
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message,
            errorCode: "VALIDATION_ERROR",
        });
    }

    // Nếu là lỗi từ MongoDB / Sequelize / v.v
    if (err.code && err.code.startsWith && err.code.startsWith("ER_")) {
        return res.status(400).json({
            success: false,
            message: "Lỗi cơ sở dữ liệu",
            errorCode: err.code,
        });
    }

    // Trường hợp lỗi không xác định
    return res.status(500).json({
        success: false,
        message: err.message || "Lỗi máy chủ nội bộ",
    });
};

module.exports = errorMiddleware;
