class CreateFloorRequest {
    constructor(data) {
        this.number = data.number;
        this.buildingId = data.buildingId;
    }
}

class GetFloorRequest {
    constructor(data) {
        this.buildingId = data.buildingId;
    }
}

module.exports = { CreateFloorRequest, GetFloorRequest };