class RegisterRequest {
  constructor(body) {
    this.mssv = body.mssv;
    this.name = body.name;
    this.email = body.email;
    this.password = body.password;
  }
}

module.exports = { RegisterRequest };
