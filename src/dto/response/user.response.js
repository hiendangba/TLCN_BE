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
module.exports = { GetUserResponse };