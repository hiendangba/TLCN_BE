class CreateNumberPlateRequest {
    constructor(data, path, studentId) {
        this.number = data.number
        this.image = path
        this.studentId = studentId
        this.registerDate = new Date().toISOString().split('T')[0];
        this.status = "pending"
    }
}

module.exports = { CreateNumberPlateRequest };