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

class GetRoomByUserResponse {
    constructor(data) {
        this.registerDate = data.registerDate;
        this.endDate = data.endDate;
        this.duration = data.duration;
        this.status = data.status;
        this.name = data.Student.User.name;
        this.identification = data.Student.User.identification;
        this.mySlotNumber = data.slotNumber;
        this.roomNumber = data.roomNumber;
        this.capacity = data.capacity;
        this.monthlyFee = data.monthlyFee;
        this.roomSlot = data.RoomSlots
        this.roomType = data.RoomType
    }
}
module.exports = { CreateRoomTypeResponse, GetRoomTypeResponse, CreateRoomResponse, GetRoomResponse, GetRoomByUserResponse };

