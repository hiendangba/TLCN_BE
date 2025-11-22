class GetRoomRegistrationResponse {
    constructor(data) {
        this.id = data.id;
        this.registerDate = data.registerDate;
        this.approvedDate = data.approvedDate;
        this.endDate = data.endDate;
        this.duration = data.duration;
        this.studentId = data.studentId;
        this.userId = data.Student.userId
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
module.exports = { GetRoomRegistrationResponse, GetRoomCancelResponse };
