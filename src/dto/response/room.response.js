class CreateRoomTypeResponse {
    constructor(data) {
        this.type = data.type;
        this.amenities = data.amenities;
    }
}

class GetRoomTypeResponse {
    constructor(data) {
        this.id = data.id;
        this.type = data.type;
        this.amenities = data.amenities;
    }
}

class CreateRoomResponse {
    constructor(data) {
        this.roomNumber = data.roomNumber;
        this.capacity = data.capacity;
        this.monthlyFee = data.monthlyFee;
        this.floorId = data.floorId;
        this.roomTypeId = data.roomTypeId;
    }
}

class GetRoomResponse {
    constructor(data) {
        this.id = data.id;
        this.roomNumber = data.roomNumber;
        this.capacity = data.capacity;
        this.monthlyFee = data.monthlyFee;
        this.floor_number = data.Floor.number;
        this.roomType_type = data.RoomType.type;
        this.roomType_amenities = data.RoomType.amenities;
        this.roomSlots = data.RoomSlots;
    }
}
module.exports = { CreateRoomTypeResponse, GetRoomTypeResponse, CreateRoomResponse, GetRoomResponse };

