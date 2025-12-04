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
        this.limit = data.limit ? Number(data.limit) : 10 ;
        this.keyword = data.keyword ? data.keyword.trim() : "";
        this.startDate = data.startDate || null;
        this.endDate = data.endDate || null;
    }
}

class GetRevenue {
    constructor(data) { 
        this.userId = data.userId || null;
        this.type = data.type || null;
        this.startDate = data.startDate || null;
        this.endDate = data.endDate || null;
    }
}

module.exports = { PaymentRequest, GetPaymentByUserId, GetRevenue };