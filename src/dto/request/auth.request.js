const StudentStatus = {
  REGISTERED: "REGISTERED",
  APPROVED_NOT_CHANGED: "APPROVED_NOT_CHANGED",
  APPROVED_CHANGED: "APPROVED_CHANGED",
  LOCKED: "LOCKED",
};
Object.freeze(StudentStatus);

class RegisterAccountRequest {
  constructor(data) {
    this.name = data.name;
    this.identification = data.identification;
    this.password = "";
    this.dob = data.dob;
    this.gender = data.gender;
    this.phone = data.phone;
    this.email = data.email;
    this.nation = data.nation;
    this.region = data.region;
    this.address = data.address;
    this.status = StudentStatus.REGISTERED;
    this.mssv = data.mssv;
    this.school = data.school;
    this.avatar = data.avatar;
    this.frontIdentificationImage = data.frontIdentificationImage;
    this.roomSlotId = data.roomSlotId
    this.duration = data.duration
  }
}
class LoginRequest {
  constructor(data) {
    this.identification = data.identification;
    this.password = data.password;
  }
}


class RegisterAccountAdminRequest {
  constructor(data) {
    this.name = data.name;
    this.identification = data.identification;
    this.password = "";
    this.dob = data.dob;
    this.gender = data.gender;
    this.phone = data.phone;
    this.email = data.email;
    this.nation = data.nation;
    this.region = data.region;
    this.address = data.address;
    this.status = StudentStatus.APPROVED_NOT_CHANGED;
    this.avatar = data.avatar;
    this.frontIdentificationImage = data.frontIdentificationImage;
  }
}

module.exports = { RegisterAccountRequest, StudentStatus, LoginRequest, RegisterAccountAdminRequest };