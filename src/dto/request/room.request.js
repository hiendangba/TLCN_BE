class CreateRoomTypeRequest {
    constructor(data) {
        this.type = data.type;
        this.amenities = data.amenities;
    }
}

class CreateRoomRequest {
    constructor(data) {
        this.roomNumber = data.roomNumber;
        this.capacity = data.capacity;
        this.monthlyFee = data.monthlyFee;
        this.floorId = data.floorId;
        this.roomTypeId = data.roomTypeId;
    }
}

class GetRoomRequest {
    constructor(data) {
        this.buildingId = data.buildingId;
        this.roomTypeId = data.roomTypeId;
    }
}

module.exports = { CreateRoomTypeRequest, CreateRoomRequest, GetRoomRequest };