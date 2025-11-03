class GetUserRequest {
    constructor(data) {
        this.userId = data.userId;
        this.role = data.role;
        this.roleId = data.roleId
    }
}

class ChangePasswordRequest {
    constructor(data) {
        this.userId = data.userId;
        this.password = data.password;
        this.confirmPassword = data.confirmPassword
    }
}

module.exports = { GetUserRequest, ChangePasswordRequest };