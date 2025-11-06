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

module.exports = { CreateMeterReading, ItemMeterReading }