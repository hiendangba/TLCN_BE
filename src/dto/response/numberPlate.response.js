class CreateNumberPlateResponse {
    constructor(data) {
        this.number = data.number
        this.image = data.image
        this.studentId = data.studentId
        this.registerDate = data.registerDate
        this.status = data.status
    }
}

module.exports = { CreateNumberPlateResponse };