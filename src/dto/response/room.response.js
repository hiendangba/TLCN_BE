class CreateRoomTypeResponse {
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

module.exports = { CreateRoomTypeResponse };