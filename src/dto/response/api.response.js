class ApiResponse {
  constructor(data, options = {}) {
    const {
      success = true,
      message,
      page,
      limit,
      totalItems,
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
    if (page !== undefined && limit !== undefined && totalItems !== undefined) {
      this.page = page;
      this.limit = limit;
      this.totalItems = totalItems;
    }

    // Meta bổ sung
    if (Object.keys(meta).length > 0) {
      this.meta = meta;
    }
  }
}

module.exports = ApiResponse;
