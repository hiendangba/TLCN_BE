const asyncHandler = require('express-async-handler');
const ApiResponse = require("../dto/response/api.response");
const { GetBankResponse } = require("../dto/response/bank.response");
const bankService = require("../services/bank.service")
const bankController = {
    getBank: asyncHandler(async (req, res) => {
        const response = await bankService.getBank(req);
        const getBankResponses = response.map(item => new GetBankResponse(item));
        return res.status(200).json(
            new ApiResponse(getBankResponses))
    }),
};

module.exports = bankController;