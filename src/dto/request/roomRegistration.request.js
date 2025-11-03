class CreateRoomRegistrationRequest {
    constructor(data, studentId) {
        this.roomSlotId = data.roomSlotId
        this.endDate = data.endDate
        this.studentId = studentId
        this.registerDate = new Date().toISOString().split('T')[0];
    }
}

module.exports = { CreateRoomRegistrationRequest };