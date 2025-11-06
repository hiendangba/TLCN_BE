class AppError extends Error {
    constructor(message, statusCode = 400, errorCode = null) {
        super(Array.isArray(message) ? message.join('; ') : message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
    }
}

module.exports = AppError;