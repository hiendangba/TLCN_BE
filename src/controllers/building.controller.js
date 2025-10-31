const asyncHandler = require('express-async-handler');
const buildingServices = require("../services/building.service")
const { CreateBuildingRequest } = require("../dto/request/building.request")
const { CreateBuildingResponse } = require("../dto/response/building.response")
const ApiResponse = require("../dto/response/api.response");
const buildingController = {
    createBuilding: asyncHandler(async (req, res) => {
        const createBuildingRequest = new CreateBuildingRequest(req.body);
        const response = await buildingServices.createBuilding(createBuildingRequest)
        const createBuildingResponse = new CreateBuildingResponse(response)
        return res.status(201).json(
            new ApiResponse(createBuildingResponse)
        );
    }),
};

module.exports = buildingController;