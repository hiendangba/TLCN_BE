const asyncHandler = require('express-async-handler');
const roomServices = require("../services/room.service")
const ApiResponse = require("../dto/response/api.response");
const { CreateRoomTypeRequest } = require("../dto/request/room.request")
const { CreateRoomTypeResponse } = require("../dto/response/room.response")
const roomController = {
    createRoomType: asyncHandler(async (req, res) => {
        const createRoomTypeRequest = new CreateRoomTypeRequest(req.body);
        const response = await roomServices.createRoomType(createRoomTypeRequest)
        const createRoomTypeResponse = new CreateRoomTypeResponse(response);
        return res.status(201).json(
            new ApiResponse(createRoomTypeResponse)
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
};

module.exports = roomController;