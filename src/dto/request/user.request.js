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

class UpdateProfileRequest {
    constructor(data, userId, roleId) {
        this.userId = userId;
        this.roleId = roleId;
        if (data.email !== undefined) this.email = data.email;
        if (data.phone !== undefined) this.phone = data.phone;
        if (data.region !== undefined) this.region = data.region;
        if (data.mssv !== undefined) this.mssv = data.mssv;
        if (data.school !== undefined) this.school = data.school;
    }
}

module.exports = { GetUserRequest, ChangePasswordRequest, UpdateProfileRequest };