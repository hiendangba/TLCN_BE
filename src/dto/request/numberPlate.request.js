class CreateNumberPlateRequest {
    constructor(data, path, studentId) {
        this.number = data.number
        this.image = path
        this.studentId = studentId
        this.registerDate = new Date().toISOString().split('T')[0];
        this.status = "pending"
    }
}

class RecognizeNumberPlateRequest {
    constructor(path, studentId) {
        this.image = path
        this.studentId = studentId
    }
}

class GetNumberPlateRequest {
    constructor(data) {
        const pageNum = parseInt(data.page);
        const limitNum = parseInt(data.limit);
        this.page = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
        this.limit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;
        this.keyword = data.keyword ? data.keyword.trim() : "";
        this.status = data.status;
    }
}

class ApprovedNumberPlateRequest {
    constructor(data, adminId) {
        this.ids = data.ids
        this.adminId = adminId
    }
}

class RejectNumberPlateRequest {
    constructor(data) {
        this.ids = data.ids
        // reasons có thể là:
        // - string: lý do chung cho tất cả đơn
        // - object: { [id]: reason } - lý do riêng cho từng đơn
        if (typeof data.reasons === 'object' && !Array.isArray(data.reasons) && data.reasons !== null) {
            // Nếu là object, map id -> reason
            this.reasons = data.reasons;
        } else if (data.reason) {
            // Nếu là string, tạo object với cùng lý do cho tất cả
            const commonReason = data.reason.trim();
            this.reasons = {};
            data.ids.forEach(id => {
                this.reasons[id] = commonReason;
            });
        } else {
            // Không có lý do
            this.reasons = {};
        }
    }
}

class DeleteNumberPlateRequest {
    constructor(data) {
        this.id = data.id
    }
}

module.exports = { CreateNumberPlateRequest, RecognizeNumberPlateRequest, GetNumberPlateRequest, ApprovedNumberPlateRequest, RejectNumberPlateRequest, DeleteNumberPlateRequest };