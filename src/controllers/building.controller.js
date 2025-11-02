const asyncHandler = require('express-async-handler');
const buildingServices = require("../services/building.service")
const { CreateBuildingRequest, GetBuildingRequest } = require("../dto/request/building.request")
const { CreateBuildingResponse, GetBuildingResponse } = require("../dto/response/building.response")
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

    getBuilding: asyncHandler(async (req, res) => {
        const getBuildingRequest = new GetBuildingRequest(req.query);
        const response = await buildingServices.getBuilding(getBuildingRequest)
        const getBuildingResponses = response.map(item => new GetBuildingResponse(item));
        return res.status(200).json(
            new ApiResponse(getBuildingResponses)
        );
    }),
};

module.exports = buildingController;