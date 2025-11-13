class CreateNumberPlateRequest {
    constructor(data, path, studentId) {
        this.number = data.number
        this.image = path
        this.studentId = studentId
        this.registerDate = new Date().toISOString().split('T')[0];
        this.status = "pending"
    }
}

class GetNumberPlateRequest {
    constructor(data) {
        this.page = parseInt(data.page)
        this.limit = parseInt(data.limit)
        this.keyword = data.keyword ? data.keyword.trim() : ""
        this.status = data.status
    }
}

class ApprovedNumberPlateRequest {
    constructor(data, adminId) {
        this.ids = data.ids
        this.adminId = adminId
    }
}

class RejectNumberPlateRequest {
    constructor(data) {
        this.ids = data.ids
    }
}

module.exports = { CreateNumberPlateRequest, GetNumberPlateRequest, ApprovedNumberPlateRequest, RejectNumberPlateRequest };