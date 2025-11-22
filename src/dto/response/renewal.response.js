class CreateRenewalResponse {
    constructor(data) {
        this.isActive = data.isActive;
        this.startedBy = data.startedBy;
        this.createdAt = data.createdAt;
    }
}

class StopRenewalResponse {
    constructor(data) {
        this.isActive = data.isActive;
        this.startedBy = data.startedBy;
        this.createdAt = data.createdAt;
        this.stoppedBy = data.stoppedBy;
        this.stoppedAt = data.updatedAt;
    }
}

class GetActiveResponse {
    constructor(data) {
        this.isActive = data.isActive;
    }
}

class GetHistoryResponse {
    constructor(data) {
        this.isActive = data.isActive;
        this.startedName = data.startedByAdmin.User.name;
        this.stoppedName = data.stoppedByAdmin?.User?.name || null;
        this.createdAt = data.createdAt;
        this.stoppedAt = data.updatedAt;

    }
}

module.exports = { CreateRenewalResponse, StopRenewalResponse, GetActiveResponse, GetHistoryResponse }