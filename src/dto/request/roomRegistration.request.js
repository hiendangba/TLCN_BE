class GetRoomRegistrationRequest {
    constructor(data) {
        const pageNum = parseInt(data.page);
        const limitNum = parseInt(data.limit);
        this.page = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
        this.limit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;
        this.keyword = data.keyword ? data.keyword.trim() : "";
        this.status = data.status || "All";
    }
}

class CreateRoomRegistrationRequest {
    constructor(data, studentId) {
        this.roomSlotId = data.roomSlotId
        this.duration = data.duration
        this.studentId = studentId
        this.registerDate = new Date().toISOString().split('T')[0];
    }
}
class ApprovedRoomRegistrationRequest {
    constructor(data, adminId) {
        this.ids = data.ids
        this.adminId = adminId
    }
}


class RejectRoomRegistrationRequest {
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

class CancelRoomRegistrationRequest {
    constructor(data, roleId) {
        this.reason = data.reason || "";
        this.checkoutDate = data.checkoutDate;
        this.roleId = roleId;
    }
}

class GetCancelRoomRequest {
    constructor(data) {
        const pageNum = parseInt(data.page);
        const limitNum = parseInt(data.limit);
        this.page = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
        this.limit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;
        this.keyword = data.keyword ? data.keyword.trim() : "";
        this.status = data.status || "All";
    }
}

class ApprovedCancelRoomRequest {
    constructor(data, adminId) {
        this.ids = data.ids
        this.adminId = adminId
    }
}

class RejectCancelRoomRequest {
    constructor(data, adminId) {
        this.ids = data.ids;
        this.adminId = adminId;
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

class RoomMoveRequest {
    constructor(data, roleId) {
        this.roomSlotId = data.roomSlotId;
        this.duration = data.duration;
        this.roleId = roleId;
    }
}

class GetRoomMoveRequest {
    constructor(data) {
        const pageNum = parseInt(data.page);
        const limitNum = parseInt(data.limit);
        this.page = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
        this.limit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;
        this.keyword = data.keyword ? data.keyword.trim() : "";
        this.status = data.status || "All";
    }
}

class ApprovedMoveRoomRequest {
    constructor(data, adminId) {
        this.ids = data.ids
        this.adminId = adminId
    }
}

class RoomExtendRequest {
    constructor(data, roleId) {
        this.duration = data.duration;
        this.roleId = roleId;
    }
}

class GetRoomExtendRequest {
    constructor(data) {
        const pageNum = parseInt(data.page);
        const limitNum = parseInt(data.limit);
        this.page = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
        this.limit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;
        this.keyword = data.keyword ? data.keyword.trim() : "";
        this.status = data.status || "All";
    }
}


class ApprovedExtendRoomRequest {
    constructor(data, adminId) {
        this.ids = data.ids
        this.adminId = adminId
    }
}

module.exports = {
    CreateRoomRegistrationRequest, ApprovedRoomRegistrationRequest,
    GetRoomRegistrationRequest, RejectRoomRegistrationRequest,
    CancelRoomRegistrationRequest, GetCancelRoomRequest,
    ApprovedCancelRoomRequest, RoomMoveRequest,
    GetRoomMoveRequest, ApprovedMoveRoomRequest,
    RoomExtendRequest, GetRoomExtendRequest,
    ApprovedExtendRoomRequest, RejectCancelRoomRequest
};