class GetFloorResponse {
    constructor(data) {
        this.id = data.id;
        this.number = data.number;
        this.buildingId = data.buildingId;
    }
}

module.exports = { GetFloorResponse };