const AppError = require("./AppError");

class FloorError extends AppError {
    static BuildingNotFound() {
        return new FloorError("Building not found", 404, "FLOOR_BUILDING_NOT_FOUND");
    }
    static FloorAlreadyExists() {
        return new FloorError("Floor already exists in this building", 409, "FLOOR_ALREADY_EXISTS");
    }
    static FirstFloorMustBeOne() {
        return new FloorError("Tòa nhà chưa có tầng nào, chỉ có thể thêm tầng 1", 400, "FIRST_FLOOR_MUST_BE_ONE");
    };

    static InvalidFloorOrder(expectedFloor) {
        return new FloorError(`Tầng tiếp theo phải là ${expectedFloor}`, 400, "INVALID_FLOOR_ORDER");
    };

    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}

module.exports = FloorError;