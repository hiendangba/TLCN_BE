class CreateRoomTypeResponse {
    constructor(data) {
        this.type = data.type;
        this.amenities = data.amenities;
    }
}

class GetRoomResponse {
    constructor(data){
        this.floor = data.floor;  // phien ban response
        this.building = data.building;  // phien ban response
        this.availableSlots = data.availableSlots;
        this.roomNumber = data.roomNumber;
        this.roomType = data.roomType; // phien ban response
    }
}

module.exports = { CreateRoomTypeResponse, GetRoomResponse};