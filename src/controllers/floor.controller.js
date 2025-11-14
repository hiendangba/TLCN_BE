const asyncHandler = require('express-async-handler');
const floorServices = require("../services/floor.service")
const { GetFloorRequest } = require("../dto/request/floor.request")
const { GetFloorResponse } = require("../dto/response/floor.response")
const ApiResponse = require("../dto/response/api.response");
const floorController = {
    getFloor: asyncHandler(async (req, res) => {
        const getFloorRequest = new GetFloorRequest(req.query);
        const response = await floorServices.getFloor(getFloorRequest)
        const getFloorResponses = response.map(item => new GetFloorResponse(item));
        return res.status(200).json(
            new ApiResponse(getFloorResponses)
        );
    }),
};

module.exports = floorController;