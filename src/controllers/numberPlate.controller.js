const asyncHandler = require('express-async-handler');
const numberPlateServices = require("../services/numberPlate.service")
const { CreateNumberPlateRequest, RecognizeNumberPlateRequest, GetNumberPlateRequest, ApprovedNumberPlateRequest, RejectNumberPlateRequest, DeleteNumberPlateRequest } = require("../dto/request/numberPlate.request")
const ApiResponse = require("../dto/response/api.response");
const { CreateNumberPlateResponse, GetNumberPlateResponse } = require("../dto/response/numberPlate.response")
const UserError = require("../errors/UserError")
const numberPlateController = {
    createNumberPlate: asyncHandler(async (req, res) => {
        if (!req.file) {
            throw UserError.NoImageUpload();
        }

        const createNumberPlateRequest = new CreateNumberPlateRequest(req.body, req.file.path, req.roleId)
        const response = await numberPlateServices.createNumberPlate(createNumberPlateRequest, req.file.filename)
        const createNumberPlateResponse = new CreateNumberPlateResponse(response)

        return res.status(201).json(
            new ApiResponse(createNumberPlateResponse)
        );
    }),

    getNumberPlate: asyncHandler(async (req, res) => {
        const getNumberPlateRequest = new GetNumberPlateRequest(req.query)
        const { totalItems, response } = await numberPlateServices.getNumberPlate(getNumberPlateRequest)
        const getNumberPlateResponses = response.map(item => new GetNumberPlateResponse(item));
        return res.status(200).json(
            new ApiResponse(getNumberPlateResponses,
                { page: getNumberPlateRequest.page, limit: getNumberPlateRequest.limit, totalItems })
        );
    }),

    getNumberPlateByUser: asyncHandler(async (req, res) => {
        const response = await numberPlateServices.getNumberPlateByUser(req.roleId)
        const getNumberPlateResponses = response.map(item => new GetNumberPlateResponse(item));
        return res.status(200).json(
            new ApiResponse(getNumberPlateResponses)
        );
    }),


    approvedNumberPlate: asyncHandler(async (req, res) => {
        const approvedNumberPlateRequest = new ApprovedNumberPlateRequest(req.body, req.roleId)
        const response = await numberPlateServices.approvedNumberPlate(approvedNumberPlateRequest)
        return res.status(200).json(
            new ApiResponse(response))
    }),

    rejectNumberPlate: asyncHandler(async (req, res) => {
        const rejectNumberPlateRequest = new RejectNumberPlateRequest(req.body)
        const response = await numberPlateServices.rejectNumberPlate(rejectNumberPlateRequest)
        return res.status(200).json(
            new ApiResponse(response))
    }),

    deleteNumberPlate: asyncHandler(async (req, res) => {
        const deleteNumberPlateRequest = new DeleteNumberPlateRequest(req.params)
        const response = await numberPlateServices.deleteNumberPlate(deleteNumberPlateRequest)
        return res.status(200).json(
            new ApiResponse(response))
    }),

    recognizeNumberPlate: asyncHandler(async (req, res) => {
        if (!req.file) {
            throw UserError.NoImageUpload();
        }
        const recognizeNumberPlateRequest = new RecognizeNumberPlateRequest(req.file.path, req.roleId)
        const response = await numberPlateServices.recognizeNumberPlate(recognizeNumberPlateRequest, req.file)
        return res.status(200).json(
            new ApiResponse(response))
    }),
};

module.exports = numberPlateController;