class CreateRoomTypeResponse {
    constructor(data) {
        this.type = data.type;
        this.amenities = data.amenities;
        this.monthlyFee = data.monthlyFee;
        this.capacity = data.capacity;
        this.description = data.description;
    }
}

class GetFloorRequest {
    constructor(data) {
        this.buildingId = data.buildingId;
    }
}

module.exports = { CreateRoomTypeResponse };