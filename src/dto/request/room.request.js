class CreateRoomTypeRequest {
    constructor(data) {
        this.type = data.type;
        this.amenities = data.amenities;
    }
}

class GetFloorRequest {
    constructor(data) {
        this.buildingId = data.buildingId;
    }
}

module.exports = { CreateRoomTypeRequest, GetFloorRequest };