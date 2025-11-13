class CreateNumberPlateResponse {
    constructor(data) {
        this.number = data.number
        this.image = data.image
        this.studentId = data.studentId
        this.registerDate = data.registerDate
        this.status = data.status
    }
}
class GetNumberPlateResponse {
    constructor(data) {
        this.id = data.id;
        this.registerDate = data.registerDate;
        this.image = data.image;
        this.number = data.number;
        this.studentId = data.studentId;
        this.userId = data.Student.userId
        this.mssv = data.Student.mssv;
        this.school = data.Student.school;
        this.identification = data.Student.User.identification;
        this.name = data.Student.User.name;
        this.dob = data.Student.User.dob;
        this.gender = data.Student.User.gender;
        this.address = data.Student.User.address;
    }
}
module.exports = { CreateNumberPlateResponse, GetNumberPlateResponse };