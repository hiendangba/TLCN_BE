const asyncHandler = require('express-async-handler');
const ApiResponse = require("../dto/response/api.response");
const { GetUserRequest, ChangePasswordRequest } = require("../dto/request/user.request")
const { GetUserResponse } = require("../dto/response/user.response")
const userServices = require("../services/user.service")
const userController = {
    getUser: asyncHandler(async (req, res) => {
        const getUserRequest = new GetUserRequest({ userId: req.userId, role: req.role, roleId: req.roleId })
        const response = await userServices.getUser(getUserRequest)
        const getUserResponse = new GetUserResponse(response)
        return res.status(200).json(
            new ApiResponse(getUserResponse)
        );
    }),

    changePassword: asyncHandler(async (req, res) => {
        const changePasswordRequest = new ChangePasswordRequest({ ...req.body, userId: req.userId })
        const response = await userServices.changePassword(changePasswordRequest)
        return res.status(200).json(
            new ApiResponse(response)
        );
    }),
    
    // mai sửa phần này
    updateProfile: asyncHandler(async (req, res) => {
        const changePasswordRequest = new ChangePasswordRequest({ ...req.body, userId: req.userId })
        const response = await userServices.changePassword(changePasswordRequest)
        return res.status(200).json(
            new ApiResponse(response)
        );
    }),
}

module.exports = userController;