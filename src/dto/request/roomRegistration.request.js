class GetRoomRegistrationRequest {
    constructor(data) {
        this.page = parseInt(data.page)
        this.limit = parseInt(data.limit)
        this.keyword = data.keyword ? data.keyword.trim() : ""
        this.status = data.status
    }
}

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
        this.ids = data.ids
        this.adminId = adminId
    }
}
module.exports = { CreateRoomRegistrationRequest, ApprovedRoomRegistrationRequest, GetRoomRegistrationRequest };