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
    }
}

module.exports = {
    GetPaymentReponse,
    PaymentReponse
}