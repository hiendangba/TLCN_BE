const asyncHandler = require('express-async-handler');
const { ApprovedRoomRegistrationRequest, GetRoomRegistrationRequest, RejectRoomRegistrationRequest, CancelRoomRegistrationRequest } = require("../dto/request/roomRegistration.request")
const ApiResponse = require("../dto/response/api.response");
const { GetRoomRegistrationResponse } = require("../dto/response/roomRegistration.response")
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
};

module.exports = roomRegistrationController;