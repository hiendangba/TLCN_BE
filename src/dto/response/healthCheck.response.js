

class HealthCheckResponse {
    constructor(data) {
        this.id = data.id
        this.title = data.title;
        this.description = data.description;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.capacity = data.capacity;
        this.registeredCount = data.registeredCount;
        this.buildingName = data.buildingName;
        this.buildingId = data.buildingId;
        this.price = data.price;
        this.registrationStartDate = data.registrationStartDate;
        this.registrationEndDate = data.registrationEndDate;
        this.status = data.status;
    }
}
class RegisterHealthCheckReponse  {
    constructor(data) {
        this.studentId = data.studentId;
        this.healthCheckId = data.healthCheckId;
        this.studentName = data.studentName;
        this.studentIdentification = data.studentIdentification;
        this.healthCheckTitle = data.healthCheckTitle;
        this.healthCheckBuilding = data.healthCheckBuilding;
        this.period = data.period;
        this.fee = data.fee;
        this.dueDate = data.dueDate;
        this.registerDate = data.registerDate;
        this.note = data.note;
    }
}
module.exports = { HealthCheckResponse, RegisterHealthCheckReponse }