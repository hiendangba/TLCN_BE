class GetHistoryRenewalRequest {
    constructor(data) {
        const pageNum = parseInt(data.page);
        const limitNum = parseInt(data.limit);
        this.page = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
        this.limit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;
        this.keyword = data.keyword ? data.keyword.trim() : "";
        this.status = data.status || "All";
    }
}
module.exports = { GetHistoryRenewalRequest };