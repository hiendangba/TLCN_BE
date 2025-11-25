class PaymentRequest {
    constructor(data) {
        this.paymentId = data.paymentId;
    }
}

class GetPaymentByUserId {
    constructor(data) {
        this.userId = data.userId;
        this.type = data.type;
        this.page = data.page ? Number(data.page) : 1;
        this.limit = data.limit ;
        this.keyword = data.keyword ? data.keyword.trim() : "";
    }
}

module.exports = { PaymentRequest, GetPaymentByUserId };