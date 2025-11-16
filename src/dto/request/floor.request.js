class CreateFloorRequest {
    constructor(numberFloor, buildingId) {
        this.numberFloor = numberFloor;
        this.buildingId = buildingId;
    }
}

class GetFloorRequest {
    constructor(data) {
        this.buildingId = data.buildingId;
    }
}


module.exports = { CreateFloorRequest, GetFloorRequest };