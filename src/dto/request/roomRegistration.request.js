class CreateRoomRegistrationRequest {
    constructor(data, studentId) {
        this.roomSlotId = data.roomSlotId
        this.duration = data.duration
        this.studentId = studentId
        this.registerDate = new Date().toISOString().split('T')[0];
    }
}
class ApprovedRoomRegistrationRequest {
    constructor(data, adminId) {
        this.id = data.id
        this.adminId = adminId
    }
}
module.exports = { CreateRoomRegistrationRequest, ApprovedRoomRegistrationRequest };