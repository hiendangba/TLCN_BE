class ApiResponse {
  constructor(data, options = {}) {
    const {
      success = true,
      message,
      page,
      limit,
      totalItems,
      totalApproved,
      totalUnapproved,
      totalReject,
      paidAmount,
      unpaidAmount,
      DTOClass,
      meta = {}
    } = options;
    this.success = success;

    // Map DTO nếu có
    if (Array.isArray(data)) {
      this.data = DTOClass ? data.map(item => new DTOClass(item)) : data;
    } else {
      this.data = DTOClass && data ? new DTOClass(data) : data;
    }

    if (message) this.message = message;

    // Pagination cơ bản
    if (page !== undefined) this.page = page;
    if (limit !== undefined) this.limit = limit;
    if (totalItems !== undefined) this.totalItems = totalItems;
    if (totalApproved !== undefined) this.totalApproved = totalApproved;
    if (totalUnapproved !== undefined) this.totalUnapproved = totalUnapproved;
    if (totalReject !== undefined) this.totalReject = totalReject;
    if (paidAmount !== undefined) this.paidAmount = paidAmount;
    if (unpaidAmount !== undefined) this.unpaidAmount = unpaidAmount;

    // Meta bổ sung
    if (Object.keys(meta).length > 0) {
      this.meta = meta;
    }
  }
}

module.exports = ApiResponse;
