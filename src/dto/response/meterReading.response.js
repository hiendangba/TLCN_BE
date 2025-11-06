class CreateMeterReadingResponse {
    constructor(data) {
        this.roomId = data.roomId;
        this.type = data.type;
        this.oldValue = data.oldValue;
        this.newValue = data.newValue;
        this.unitPrice = data.unitPrice;
        this.totalAmount = data.totalAmount;
        this.period = data.period;
        this.adminId = data.adminId;
        this.readingDate = data.readingDate;
    }
}

module.exports = { CreateMeterReadingResponse }