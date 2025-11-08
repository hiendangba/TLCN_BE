const asyncHandler = require('express-async-handler');
const floorServices = require("../services/floor.service")
const { CreateFloorRequest, GetFloorRequest, DeleteFloorRequest } = require("../dto/request/floor.request")
const { CreateFloorResponse, GetFloorResponse } = require("../dto/response/floor.response")
const ApiResponse = require("../dto/response/api.response");
const floorController = {
    createFloor: asyncHandler(async (req, res) => {
        const createFloorRequest = new CreateFloorRequest(req.body);
        const response = await floorServices.createFloor(createFloorRequest)
        const createFloorResponse = new CreateFloorResponse(response);
        return res.status(201).json(
            new ApiResponse(createFloorResponse)
        );
    }),

    getFloor: asyncHandler(async (req, res) => {
        const getFloorRequest = new GetFloorRequest(req.query);
        const response = await floorServices.getFloor(getFloorRequest)
        const getFloorResponses = response.map(item => new GetFloorResponse(item));
        return res.status(200).json(
            new ApiResponse(getFloorResponses)
        );
    }),

    deleteFloor: asyncHandler(async (req, res) => {
        const deleteFloorRequest = new DeleteFloorRequest(req.params)
        const response = await floorServices.deleteFloor(deleteFloorRequest)
        return res.status(200).json(
            new ApiResponse(response)
        );
    }),
};

module.exports = floorController;