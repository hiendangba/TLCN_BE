class CreateRoomTypeRequest {
    constructor(data) {
        this.type = data.type;
        this.amenities = data.amenities;
    }
}

class CreateRoomRequest {
    constructor(data) {
        this.roomNumber = data.roomNumber;
        this.capacity = data.capacity;
        this.monthlyFee = data.monthlyFee;
        this.floorId = data.floorId;
        this.roomTypeId = data.roomTypeId;
    }
}

class GetRoomRequest {
    constructor(data) {
        this.buildingId = data.buildingId;
        this.roomTypeId = data.roomTypeId;
    }
}

class GetRoomForAdminRequest {
    constructor(data) {
        const pageNum = parseInt(data.page);
        const limitNum = parseInt(data.limit);
        this.page = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
        this.limit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;
        this.floorId = data.floorId;
        this.status = data.status
    }
}

class GetRoomTypeForAdminRequest {
    constructor(data) {
        this.buildingId = data.buildingId;
    }
}

class RoomUpdateRequest {
    constructor(data, roomId) {
        this.roomId = roomId;
        this.roomNumber = data.roomNumber;
        this.roomTypeId = data.roomTypeId;
        this.capacity = data.capacity;
        this.price = data.price;
    }
}

module.exports = { CreateRoomTypeRequest, CreateRoomRequest, GetRoomRequest, GetRoomForAdminRequest, GetRoomTypeForAdminRequest, RoomUpdateRequest };