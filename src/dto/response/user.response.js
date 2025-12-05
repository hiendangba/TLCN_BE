class GetUserResponse {
    constructor(data) {
        this.name = data.name;
        this.identification = data.identification;
        this.dob = data.dob;
        this.gender = data.gender;
        this.phone = data.phone;
        this.email = data.email;
        this.nation = data.nation;
        this.region = data.region;
        this.address = data.address;
        this.status = data.status;
        this.avatar = data.avatar;
        this.frontIdentificationImage = data.frontIdentificationImage;
        this.mssv = data.mssv;
        this.school = data.school;
        this.role = data.role;
    }
}


class GetAllUserResponse {
    constructor(data) {
        this.name = data.User.name;
        this.identification = data.User.identification;
        this.dob = data.User.dob;
        this.gender = data.User.gender;
        this.email = data.User.email;
        this.status = data.User.status;
        this.avatar = data.User.avatar;
        this.frontIdentificationImage = data.User.frontIdentificationImage;
        this.mssv = data.mssv;
        this.school = data.school;
        this.slotNumber = data.RoomRegistrations[0].RoomSlot.slotNumber;
        this.roomNumber = data.RoomRegistrations[0].RoomSlot.Room.roomNumber;
        this.registerDate = data.RoomRegistrations[0].registerDate;
        this.duration = data.RoomRegistrations[0].duration;
        this.endDate = data.RoomRegistrations[0].endDate;
    }
}
module.exports = { GetUserResponse, GetAllUserResponse };