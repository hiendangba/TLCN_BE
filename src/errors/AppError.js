class AppError extends Error {
    constructor(message, statusCode = 400, errorCode = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
    }
}

module.exports = AppError;