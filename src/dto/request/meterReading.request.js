class ItemMeterReading {
    constructor(data){
        this.roomId = data.roomId;
        this.type = data.type;
        this.oldValue = data.oldValue;
        this.newValue = data.newValue;
        this.unitPrice = data.unitPrice; 
    }
}

class CreateMeterReading {
    constructor(data) {
        this.listMeterReading = data.listMeterReading;
        this.period = data.period;
    }
}

class GetMeterReadingRequest {
    constructor(data) {
        this.page = data.page ? Number(data.page) : 1;
        this.limit = data.limit ? Number(data.limit) : 10;
        this.keyword = data.keyword ? data.keyword.trim() : "";
    }
}

module.exports = { CreateMeterReading, ItemMeterReading, GetMeterReadingRequest }