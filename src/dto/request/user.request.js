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
class GetAllUserRequest {
    constructor(data) {
        const pageNum = parseInt(data.page);
        const limitNum = parseInt(data.limit);
        this.page = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
        this.limit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;
        this.keyword = data.keyword ? data.keyword.trim() : "";
        this.status = data.status || "All";
        this.startDate = data.startDate ? data.startDate.trim() : null;
        this.endDate = data.endDate ? data.endDate.trim() : null;
    }
}

class LockUserRequest {
    constructor(data) {
        this.ids = data.ids
        if (typeof data.reasons === 'object' && !Array.isArray(data.reasons) && data.reasons !== null) {
            this.reasons = data.reasons;
        } else if (data.reason) {
            const commonReason = data.reason.trim();
            this.reasons = {};
            data.ids.forEach(id => {
                this.reasons[id] = commonReason;
            });
        } else {
            this.reasons = {};
        }
    }
}

class UnLockUserRequest {
    constructor(data) {
        this.ids = data.ids
    }
}

module.exports = { GetUserRequest, ChangePasswordRequest, UpdateProfileRequest, GetAllUserRequest, LockUserRequest, UnLockUserRequest };