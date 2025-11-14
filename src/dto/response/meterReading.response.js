class CreateMeterReadingResponse {
    constructor(data = {}) {
        this.id = data.id ?? "";
        this.roomId = data.roomId ?? "";
        this.roomNumber = data.roomNumber ?? "";
        this.type = data.type ?? ""; 
        this.oldValue = data.oldValue ?? 0;
        this.newValue = data.newValue ?? 0;
        this.unitPrice = data.unitPrice ?? 0;
        this.totalAmount = data.totalAmount ?? 0;
        this.period = data.period ?? "";
        this.adminId = data.adminId ?? "";
        this.readingDate = data.readingDate ?? null;
    }
}
module.exports = { CreateMeterReadingResponse }