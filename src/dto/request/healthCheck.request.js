class CreateHealthCheckRequest {
    constructor(data) {
        this.healthCheckId = data.healthCheckId;
        this.buildingId = data.buildingId;
        this.title = data.title;
        this.description = data.description;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.capacity = data.capacity;
        this.price = data.price;
        this.registrationStartDate = data.registrationStartDate;
        this.registrationEndDate = data.registrationEndDate;
        this.status = data.status;
    }
}

class GetHealthCheck {
    constructor(data) {
        this.startDate = data.startDate;
        this.endDate = data.endDate;
    }
}

class RegisterHealthCheck {
    constructor(data) {
        this.healthCheckId = data.healthCheckId;
        this.registerDate = data.registerDate;
        this.note = data.note;
    }
}

module.exports = {
    CreateHealthCheckRequest,
    GetHealthCheck,
    RegisterHealthCheck
}