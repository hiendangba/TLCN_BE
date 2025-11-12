const asyncHandler = require('express-async-handler');
const numberPlateServices = require("../services/numberPlate.service")
const { CreateNumberPlateRequest } = require("../dto/request/numberPlate.request")
const ApiResponse = require("../dto/response/api.response");
const { CreateNumberPlateResponse } = require("../dto/response/numberPlate.response")
const UserError = require("../errors/UserError")
const numberPlateController = {
    createNumberPlate: asyncHandler(async (req, res) => {
        if (!req.file) {
            throw UserError.NoImageUpload();
        }
        const createNumberPlateRequest = new CreateNumberPlateRequest(req.body, req.file.path, req.roleId)
        const response = await numberPlateServices.createNumberPlate(createNumberPlateRequest, req.file.filename)
        const createNumberPlateResponse = new CreateNumberPlateResponse(response)
        return res.status(200).json(
            new ApiResponse(createNumberPlateResponse)
        );
    }),

    getNumberPlate: asyncHandler(async (req, res) => {
        const response = await numberPlateServices.createNumberPlate(createNumberPlateRequest, req.file.filename)
        const createNumberPlateResponse = new CreateNumberPlateResponse(response)
        return res.status(200).json(
            new ApiResponse(createNumberPlateResponse)
        );
    }),
};

module.exports = numberPlateController;