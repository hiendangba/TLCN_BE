const asyncHandler = require('express-async-handler');
const ApiResponse = require("../dto/response/api.response");
const roomRegistrationService = require("../services/roomRegistration.service")
const roomRegistrationController = {
    getRoomRegistration: asyncHandler(async (req, res) => {
        const response = await roomRegistrationService.getRoomRegistration();
        return res.status(200).json(
            new ApiResponse("get room registration")
        );
    }),
};

module.exports = roomRegistrationController;