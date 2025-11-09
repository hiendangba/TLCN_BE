class GetRoomRegistrationResponse {
    constructor(data) {
        this.id = data.id;
        this.registerDate = data.registerDate;
        this.duration = data.duration;
        this.studentId = data.studentId;
        this.userId = data.Student.userId
        this.mssv = data.Student.mssv;
        this.school = data.Student.school;
        this.name = data.Student.User.name;
        this.dob = data.Student.User.dob;
        this.gender = data.Student.User.gender;
        this.address = data.Student.User.address;
        this.slotNumber = data.RoomSlot.slotNumber;
    }
}
module.exports = { GetRoomRegistrationResponse };
