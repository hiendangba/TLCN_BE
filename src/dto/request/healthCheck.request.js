class CreateHealthCheckRequest {
    constructor(data) {
        this.buildingId = data.buildingId;
        this.title = data.title;
        this.description = data.description;
        this.location = data.location;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.capacity = data.capacity;
        this.price = data.price;
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
        this.studentId = data.studentId;
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