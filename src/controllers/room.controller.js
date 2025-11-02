const asyncHandler = require('express-async-handler');
const roomServices = require("../services/room.service")
const ApiResponse = require("../dto/response/api.response");
const { CreateRoomTypeRequest, CreateRoomRequest, GetRoomRequest } = require("../dto/request/room.request")
const { CreateRoomTypeResponse, GetRoomTypeResponse, CreateRoomResponse, GetRoomResponse } = require("../dto/response/room.response")
const roomController = {
    createRoomType: asyncHandler(async (req, res) => {
        const createRoomTypeRequest = new CreateRoomTypeRequest(req.body);
        const response = await roomServices.createRoomType(createRoomTypeRequest)
        const createRoomTypeResponse = new CreateRoomTypeResponse(response);
        return res.status(201).json(
            new ApiResponse(createRoomTypeResponse)
        );
    }),

    getRoomType: asyncHandler(async (req, res) => {
        const response = await roomServices.getRoomType()
        const getRoomTypeResponses = response.map(item => new GetRoomTypeResponse(item));
        return res.status(200).json(
            new ApiResponse(getRoomTypeResponses)
        );
    }),

    createRoom: asyncHandler(async (req, res) => {
        const createRoomRequest = new CreateRoomRequest(req.body);
        const response = await roomServices.createRoom(createRoomRequest)
        const createRoomResponse = new CreateRoomResponse(response);
        return res.status(201).json(
            new ApiResponse(createRoomResponse)
        );
    }),

    getRoom: asyncHandler(async (req, res) => {
        const getRoomRequest = new GetRoomRequest(req.query);
        const response = await roomServices.getRoom(getRoomRequest)
        const getRoomResponses = response.map(item => new GetRoomResponse(item));
        return res.status(200).json(
            new ApiResponse(getRoomResponses)
        );
    }),
};

module.exports = roomController;