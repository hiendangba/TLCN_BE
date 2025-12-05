class GetPaymentReponse {
    constructor(data) {
        this.paymentUrl = data;
    }
}

class PaymentReponse {
    constructor(data) {
        this.id = data.id;
        this.studentId = data.studentId;
        this.content = data.content;
        this.type = data.type;
        this.amount = data.amount;
        this.currency = data.currency;
        this.paidAt = data.paidAt;
        this.status = data.status;
        this.studentName = data.Student?.User?.name;
        this.roomNumber = data.Student?.RoomRegistrations?.[0]?.RoomSlot?.Room?.roomNumber || null;
        //  Tính DueDate 
        const createdAt = new Date(data.createdAt);
        const dueDate = new Date(createdAt);
        dueDate.setMonth(dueDate.getMonth() + 1);
        this.dueDate = dueDate;
    }
}

module.exports = {
    GetPaymentReponse,
    PaymentReponse
}