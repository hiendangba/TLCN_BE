const AppError = require("./AppError");

class MeterReadingError extends AppError {
    static InValidPeriod() {
        return new MeterReadingError("Period không hợp lệ.", 400  , "INVALID_PERIOD");
    } 
    static AlreadyExistsForPeriod (messages) {
        return new MeterReadingError(messages, 400, "DUPLICATE_PERIOD");
    }
    static InvalidRoomIds (messages) {
        return new MeterReadingError(messages, 400, "INVALID_ROOM_IDS");
    }
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = MeterReadingError;
