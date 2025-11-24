const asyncHandler = require('express-async-handler');
const {
    ApprovedRoomRegistrationRequest, GetRoomRegistrationRequest,
    RejectRoomRegistrationRequest, CancelRoomRegistrationRequest,
    GetCancelRoomRequest, ApprovedCancelRoomRequest,
    RoomMoveRequest, GetRoomMoveRequest,
    ApprovedMoveRoomRequest, RoomExtendRequest,
    GetRoomExtendRequest, ApprovedExtendRoomRequest
} = require("../dto/request/roomRegistration.request")
const ApiResponse = require("../dto/response/api.response");
const { GetRoomRegistrationResponse, GetRoomCancelResponse, GetRoomMoveResponse, GetRoomExtendResponse } = require("../dto/response/roomRegistration.response")
const roomRegistrationService = require("../services/roomRegistration.service")
const roomRegistrationController = {

    getRoomRegistration: asyncHandler(async (req, res) => {
        const getRoomRegistrationRequest = new GetRoomRegistrationRequest(req.query)
        const { totalItems, response } = await roomRegistrationService.getRoomRegistration(getRoomRegistrationRequest);
        const getRoomRegistrationResponses = response.map(item => new GetRoomRegistrationResponse(item));
        return res.status(200).json(
            new ApiResponse(getRoomRegistrationResponses,
                { page: getRoomRegistrationRequest.page, limit: getRoomRegistrationRequest.limit, totalItems })
        );
    }),

    approveRoomRegistration: asyncHandler(async (req, res) => {
        const approvedRoomRegistrationRequest = new ApprovedRoomRegistrationRequest(req.body, req.roleId)
        const response = await roomRegistrationService.approveRoomRegistration(approvedRoomRegistrationRequest);
        return res.status(200).json(
            new ApiResponse(response)
        );
    }),

    rejectRoomRegistration: asyncHandler(async (req, res) => {
        const rejectRoomRegistrationRequest = new RejectRoomRegistrationRequest(req.body)
        const response = await roomRegistrationService.rejectRoomRegistration(rejectRoomRegistrationRequest);
        return res.status(200).json(
            new ApiResponse(response)
        );
    }),

    cancelRoomRegistration: asyncHandler(async (req, res) => {
        const cancelRoomRegistrationRequest = new CancelRoomRegistrationRequest(req.body, req.roleId);
        const response = await roomRegistrationService.cancelRoomRegistration(cancelRoomRegistrationRequest);
        return res.status(200).json(
            new ApiResponse(response)
        );
    }),

    getCancelRoom: asyncHandler(async (req, res) => {
        const getCancelRoomRequest = new GetCancelRoomRequest(req.query);
        const { totalItems, response } = await roomRegistrationService.getCancelRoom(getCancelRoomRequest);
        const getRoomCancelResponses = response.map(item => new GetRoomCancelResponse(item));
        return res.status(200).json(
            new ApiResponse(getRoomCancelResponses,
                { page: getCancelRoomRequest.page, limit: getCancelRoomRequest.limit, totalItems })
        );
    }),

    approveCancelRoom: asyncHandler(async (req, res) => {
        const approvedCancelRoomRequest = new ApprovedCancelRoomRequest(req.body, req.roleId)
        const response = await roomRegistrationService.approveCancelRoom(approvedCancelRoomRequest);
        return res.status(200).json(
            new ApiResponse(response)
        );
    }),

    getRoomMove: asyncHandler(async (req, res) => {
        const getRoomMoveRequest = new GetRoomMoveRequest(req.query);
        const { totalItems, response } = await roomRegistrationService.getRoomMove(getRoomMoveRequest);
        const getRoomMoveResponses = response.map(item => new GetRoomMoveResponse(item));
        return res.status(200).json(
            new ApiResponse(getRoomMoveResponses,
                { page: getRoomMoveRequest.page, limit: getRoomMoveRequest.limit, totalItems })
        );
    }),

    requestRoomMove: asyncHandler(async (req, res) => {
        const roomMoveRequest = new RoomMoveRequest(req.body, req.roleId);
        const response = await roomRegistrationService.requestRoomMove(roomMoveRequest);
        return res.status(200).json(new ApiResponse(response));
    }),

    approveRoomMove: asyncHandler(async (req, res) => {
        const approvedMoveRoomRequest = new ApprovedMoveRoomRequest(req.body, req.roleId)
        const response = await roomRegistrationService.approveRoomMove(approvedMoveRoomRequest);
        return res.status(200).json(new ApiResponse(response));
    }),

    getExtendRoom: asyncHandler(async (req, res) => {
        const getRoomExtendRequest = new GetRoomExtendRequest(req.query);
        const { totalItems, response } = await roomRegistrationService.getExtendRoom(getRoomExtendRequest);
        const getRoomExtendResponses = response.map(item => new GetRoomExtendResponse(item));
        return res.status(200).json(
            new ApiResponse(getRoomExtendResponses,
                { page: getRoomExtendRequest.page, limit: getRoomExtendRequest.limit, totalItems })
        );
    }),

    requestRoomExtend: asyncHandler(async (req, res) => {
        const roomExtendRequest = new RoomExtendRequest(req.body, req.roleId);
        const response = await roomRegistrationService.requestRoomExtend(roomExtendRequest);
        return res.status(200).json(new ApiResponse(response));
    }),

    approveRoomExtend: asyncHandler(async (req, res) => {
        const approvedExtendRoomRequest = new ApprovedExtendRoomRequest(req.body, req.roleId)
        const response = await roomRegistrationService.approveRoomExtend(approvedExtendRoomRequest);
        return res.status(200).json(new ApiResponse(response));
    }),
};

module.exports = roomRegistrationController;