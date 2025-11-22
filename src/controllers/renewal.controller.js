const asyncHandler = require('express-async-handler');
const { GetHistoryRenewalRequest } = require("../dto/request/renewal.request")
const { CreateRenewalResponse, StopRenewalResponse, GetActiveResponse, GetHistoryResponse } = require("../dto/response/renewal.response")
const ApiResponse = require("../dto/response/api.response");
const renewalService = require("../services/renewal.service")
const renewalController = {
    createRenewal: asyncHandler(async (req, res) => {
        const response = await renewalService.createRenewal(req.roleId)
        const createRenewalResponse = new CreateRenewalResponse(response)
        return res.status(201).json(
            new ApiResponse(createRenewalResponse))
    }),

    stopRenewal: asyncHandler(async (req, res) => {
        const response = await renewalService.stopRenewal(req.roleId)
        const stopRenewalResponse = await new StopRenewalResponse(response)
        return res.status(200).json(
            new ApiResponse(stopRenewalResponse))
    }),

    getActive: asyncHandler(async (req, res) => {
        const response = await renewalService.getActive(req.roleId)
        const getActiveResponse = await new GetActiveResponse(response)
        return res.status(200).json(
            new ApiResponse(getActiveResponse))
    }),

    getHistory: asyncHandler(async (req, res) => {
        const getHistoryRenewalRequest = new GetHistoryRenewalRequest(req.query)
        const { totalItems, response } = await renewalService.getHistory(getHistoryRenewalRequest)
        const getHistoryResponses = response.map(item => new GetHistoryResponse(item));

        return res.status(200).json(
            new ApiResponse(getHistoryResponses,
                { page: getHistoryRenewalRequest.page, limit: getHistoryRenewalRequest.limit, totalItems })
        );
    })
};

module.exports = renewalController;