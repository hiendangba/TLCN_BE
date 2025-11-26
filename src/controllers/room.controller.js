const asyncHandler = require('express-async-handler');
const roomServices = require("../services/room.service")
const ApiResponse = require("../dto/response/api.response");
const { CreateRoomTypeRequest, CreateRoomRequest, GetRoomRequest, GetRoomForAdminRequest, GetRoomTypeForAdminRequest, RoomUpdateRequest, UpdateRoomTypeRequest } = require("../dto/request/room.request")
const { CreateRoomTypeResponse, GetRoomTypeResponse, CreateRoomResponse, GetRoomResponse, GetRoomByUserResponse, DeleteRoomResponse, DeleteRoomTypeResponse } = require("../dto/response/room.response");

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

    deleteRoomType: asyncHandler(async (req, res) => {
        const adminId = req.roleId;
        const roomTypeId = req.params.id;
        const response = await roomServices.deleteRoomType(roomTypeId, adminId);
        const deleteRoomResponse = new DeleteRoomTypeResponse(response);
        res.status(200).json(
            new ApiResponse(deleteRoomResponse)
        )
    }),

    updateRoomType: asyncHandler(async (req, res) => {
        const data = new UpdateRoomTypeRequest(req.body);
        const adminId = req.roleId;
        const { id: roomTypeId } = req.params;
        const response = await roomServices.updateRoomType(data, adminId, roomTypeId);
        const updateRoomReponse = new GetRoomTypeResponse(response);
        res.status(200).json(
            new ApiResponse(updateRoomReponse)
        )
    }),

    getRoomTypeForAdmin: asyncHandler(async (req, res) => {
        const getRoomTypeForAdminRequest = new GetRoomTypeForAdminRequest(req.query);
        const response = await roomServices.getRoomTypeForAdmin(getRoomTypeForAdminRequest)
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

    updateRoom: asyncHandler(async (req, res) => {
        const { id: roomId } = req.params;
        const adminId = req.roleId;
        const roomUpdateRequest = new RoomUpdateRequest(req.body, roomId);
        const response = await roomServices.updateRoom(roomUpdateRequest, adminId);
        const createRoomResponse = new CreateRoomResponse(response);
        return res.status(200).json(
            new ApiResponse(createRoomResponse)
        );
    }),

    deleteRoom: asyncHandler(async (req, res) => {
        const id = req.params.id;
        const adminId = req.roleId;
        const response = await roomServices.deleteRoom(id, adminId);
        const deleteRoomResponse = new DeleteRoomResponse(response);
        return res.status(200).json(
            new ApiResponse(deleteRoomResponse)
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

    getRoomByUser: asyncHandler(async (req, res) => {
        const response = await roomServices.getRoomByUser(req.roleId)
        const getRoomByUserResponse = new GetRoomByUserResponse(response);
        return res.status(200).json(
            new ApiResponse(getRoomByUserResponse)
        );
    }),


    getRoomHistoryByUser: asyncHandler(async (req, res) => {
        const response = await roomServices.getRoomHistoryByUser(req.roleId)
        return res.status(200).json(
            new ApiResponse(response)
        );
    }),

    getRoomForAdmin: asyncHandler(async (req, res) => {
        const getRoomForAdminRequest = new GetRoomForAdminRequest(req.query);
        const { totalItems, response } = await roomServices.getRoomForAdmin(getRoomForAdminRequest)
        const getRoomResponses = response.map(item => new GetRoomResponse(item));
        return res.status(200).json(
            new ApiResponse(getRoomResponses,
                { page: getRoomForAdminRequest.page, limit: getRoomForAdminRequest.limit, totalItems })
        );
    }),

};

module.exports = roomController;