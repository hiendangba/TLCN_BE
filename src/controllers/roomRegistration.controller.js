const asyncHandler = require('express-async-handler');
const {
    ApprovedRoomRegistrationRequest, GetRoomRegistrationRequest,
    RejectRoomRegistrationRequest, CancelRoomRegistrationRequest,
    GetCancelRoomRequest, ApprovedCancelRoomRequest
} = require("../dto/request/roomRegistration.request")
const ApiResponse = require("../dto/response/api.response");
const { GetRoomRegistrationResponse, GetRoomCancelResponse } = require("../dto/response/roomRegistration.response")
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

    requestRoomMove: asyncHandler(async (req, res) => {
        const requestRoomMoveRequest = new RequestRoomMoveRequest(req.body, req.roleId);
        const response = await roomRegistrationService.requestRoomMove(requestRoomMoveRequest);
        return res.status(200).json(new ApiResponse(response));
    }),

    approveRoomMove: asyncHandler(async (req, res) => {
        const response = await roomRegistrationService.approveRoomMove(req.roleId);
        return res.status(200).json(new ApiResponse(response));
    }),
};

module.exports = roomRegistrationController;