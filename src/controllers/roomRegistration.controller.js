const asyncHandler = require('express-async-handler');
const { ApprovedRoomRegistrationRequest } = require("../dto/request/roomRegistration.request")
const ApiResponse = require("../dto/response/api.response");
const { GetRoomRegistrationResponse } = require("../dto/response/roomRegistration.response")
const roomRegistrationService = require("../services/roomRegistration.service")
const roomRegistrationController = {
    getRoomRegistration: asyncHandler(async (req, res) => {
        const getRoomRegistrationRequest = n
        const response = await roomRegistrationService.getRoomRegistration();
        const getRoomRegistrationResponses = response.map(item => new GetRoomRegistrationResponse(item));
        return res.status(200).json(
            new ApiResponse(getRoomRegistrationResponses)
        );
    }),

    approveRoomRegistration: asyncHandler(async (req, res) => {
        const approvedRoomRegistrationRequest = new ApprovedRoomRegistrationRequest(req.body, req.roleId)
        const response = await roomRegistrationService.approveRoomRegistration(approvedRoomRegistrationRequest);
        return res.status(200).json(
            new ApiResponse(response)
        );
    }),
};

module.exports = roomRegistrationController;