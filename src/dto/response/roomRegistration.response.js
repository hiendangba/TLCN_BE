class GetRoomRegistrationResponse {
    constructor(data) {
        this.id = data.id;
        this.registerDate = data.registerDate;
        this.approvedDate = data.approvedDate;
        this.endDate = data.endDate;
        this.duration = data.duration;
        this.studentId = data.studentId;
        this.userId = data.Student.userId;
        this.status = data.originalRegistration.status;
        this.mssv = data.Student.mssv;
        this.school = data.Student.school;
        this.identification = data.Student.User.identification
        this.name = data.Student.User.name;
        this.dob = data.Student.User.dob;
        this.gender = data.Student.User.gender;
        this.address = data.Student.User.address;
        this.avatar = data.Student.User.avatar;
        this.frontIdentificationImage = data.Student.User.frontIdentificationImage;
        this.slotNumber = data.RoomSlot.slotNumber;
        this.roomNumber = data.RoomSlot.Room.roomNumber
    }
}

class GetRoomCancelResponse {
    constructor(data) {
        this.id = data.id;
        this.registerDate = data.registerDate;
        this.approvedDate = data.approvedDate;
        this.endDate = data.endDate;
        this.duration = data.duration;
        this.studentId = data.studentId;
        this.userId = data.Student.userId
        this.status = data.originalRegistration.status;
        this.mssv = data.Student.mssv;
        this.school = data.Student.school;
        this.identification = data.Student.User.identification
        this.name = data.Student.User.name;
        this.dob = data.Student.User.dob;
        this.gender = data.Student.User.gender;
        this.address = data.Student.User.address;
        this.avatar = data.Student.User.avatar;
        this.frontIdentificationImage = data.Student.User.frontIdentificationImage;
        this.slotNumber = data.RoomSlot.slotNumber;
        this.roomNumber = data.RoomSlot.Room.roomNumber;
        this.cancellationReason = data.CancellationInfo.reason;
        this.checkoutDate = data.CancellationInfo.checkoutDate;
        this.refundStatus = data.CancellationInfo.refundStatus;
        this.refundAmount = data.CancellationInfo.amount;
    }
}


class GetRoomMoveResponse {
    constructor(data) {
        this.id = data.originalRegistration.id;
        this.registerDate = data.originalRegistration.registerDate;
        this.approvedDate = data.originalRegistration.approvedDate;
        this.endDate = data.originalRegistration.endDate;
        this.duration = data.originalRegistration.duration;
        this.studentId = data.originalRegistration.studentId;
        this.userId = data.originalRegistration.Student.userId
        this.mssv = data.originalRegistration.Student.mssv;
        this.school = data.originalRegistration.Student.school;
        this.identification = data.originalRegistration.Student.User.identification
        this.name = data.originalRegistration.Student.User.name;
        this.dob = data.originalRegistration.Student.User.dob;
        this.status = data.originalRegistration.status;
        this.gender = data.originalRegistration.Student.User.gender;
        this.address = data.originalRegistration.Student.User.address;
        this.avatar = data.originalRegistration.Student.User.avatar;
        this.frontIdentificationImage = data.originalRegistration.Student.User.frontIdentificationImage;
        this.slotNumber = data.originalRegistration.RoomSlot.slotNumber;
        this.roomNumber = data.originalRegistration.RoomSlot.Room.roomNumber;
        this.monthlyFee = data.originalRegistration.RoomSlot.Room.monthlyFee;
        this.newSlotNumber = data.newRegistration.RoomSlot.slotNumber;
        this.newRoomNumber = data.newRegistration.RoomSlot.Room.roomNumber;
        this.newMonthlyFee = data.newRegistration.RoomSlot.Room.monthlyFee;
        this.newDuration = data.newRegistration.duration;
        this.newEndDate = data.newRegistration.endDate;
    }
}

class GetRoomExtendResponse {
    constructor(data) {
        this.id = data.originalRegistration.id;
        this.registerDate = data.originalRegistration.registerDate;
        this.approvedDate = data.originalRegistration.approvedDate;
        this.endDate = data.originalRegistration.endDate;
        this.duration = data.originalRegistration.duration;
        this.studentId = data.originalRegistration.studentId;
        this.userId = data.originalRegistration.Student.userId
        this.mssv = data.originalRegistration.Student.mssv;
        this.school = data.originalRegistration.Student.school;
        this.identification = data.originalRegistration.Student.User.identification
        this.name = data.originalRegistration.Student.User.name;
        this.dob = data.originalRegistration.Student.User.dob;
        this.gender = data.originalRegistration.Student.User.gender;
        this.status = data.originalRegistration.status;
        this.address = data.originalRegistration.Student.User.address;
        this.avatar = data.originalRegistration.Student.User.avatar;
        this.frontIdentificationImage = data.originalRegistration.Student.User.frontIdentificationImage;
        this.slotNumber = data.originalRegistration.RoomSlot.slotNumber;
        this.roomNumber = data.originalRegistration.RoomSlot.Room.roomNumber;
        this.monthlyFee = data.originalRegistration.RoomSlot.Room.monthlyFee;
        this.newDuration = data.newRegistration.duration;
        this.newEndDate = data.newRegistration.endDate;
    }
}
module.exports = { GetRoomRegistrationResponse, GetRoomCancelResponse, GetRoomMoveResponse, GetRoomExtendResponse };
