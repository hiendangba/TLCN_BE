class CreateRoomTypeResponse {
    constructor(data) {
        this.type = data.type;
        this.amenities = data.amenities;
    }
}

class DeleteRoomTypeResponse {
    constructor(data) {
        this.id = data.id;
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
        this.floorId = data.floorId || data.Floor?.id;
        this.floor_number = data.Floor?.number;
        this.buildingId = data.Floor?.buildingId;
        this.roomTypeId = data.roomTypeId || data.RoomType?.id;
        this.roomType_type = data.RoomType?.type;
        this.roomType_amenities = data.RoomType?.amenities;
        this.roomSlots = data.RoomSlots
            .map(slot => {
                if (slot.RoomRegistrations && slot.RoomRegistrations.length > 0) {
                    // Nếu có RoomRegistrations, trả về thông tin từng registration
                    return slot.RoomRegistrations.map(reg => ({
                        id: slot.id,
                        slotNumber: slot.slotNumber,
                        isOccupied: slot.isOccupied,
                        mssv: reg.Student.mssv,
                        name: reg.Student.User.name,
                        identification: reg.Student.User.identification,
                        dob: reg.Student.User.dob
                    }));
                } else {
                    // Nếu không có registration, vẫn trả về slotNumber
                    return [{
                        id: slot.id,
                        slotNumber: slot.slotNumber,
                        isOccupied: slot.isOccupied,
                        // Những trường khác bỏ trống hoặc undefined
                    }];
                }
            })
            .flat();
    }
}

class DeleteRoomResponse {
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
        this.status =
            data.CancellationInfo?.refundStatus === "PENDING"
                ? "CANCEL_PENDING"
                : data.status;
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
module.exports = { CreateRoomTypeResponse, GetRoomTypeResponse, CreateRoomResponse, GetRoomResponse, GetRoomByUserResponse, DeleteRoomResponse, DeleteRoomTypeResponse };

