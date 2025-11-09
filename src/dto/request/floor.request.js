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


class DeleteFloorRequest {
    constructor(data) {
        this.id = data.id;
    }
}
module.exports = { CreateFloorRequest, GetFloorRequest, DeleteFloorRequest };