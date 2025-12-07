const asyncHandler = require('express-async-handler');
const ApiResponse = require("../dto/response/api.response");
const { GetUserRequest, ChangePasswordRequest, UpdateProfileRequest, GetAllUserRequest, LockUserRequest, UnLockUserRequest } = require("../dto/request/user.request")
const { GetUserResponse, GetAllUserResponse } = require("../dto/response/user.response")
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

    updateProfile: asyncHandler(async (req, res) => {
        const updateProfileRequest = new UpdateProfileRequest(req.body, req.userId, req.roleId)
        const response = await userServices.updateProfile(updateProfileRequest)
        return res.status(200).json(
            new ApiResponse(response)
        );
    }),

    getAllUser: asyncHandler(async (req, res) => {
        const getAllUserRequest = new GetAllUserRequest(req.query)
        const { totalApproved, totalUnapproved, totalItems, response } = await userServices.getAllUser(getAllUserRequest)
        const getAllUserResponses = response.map(item => new GetAllUserResponse(item));
        return res.status(200).json(
            new ApiResponse(getAllUserResponses, {
                page: getAllUserRequest.page, limit: getAllUserRequest.limit, totalItems,
                totalApproved, totalUnapproved
            })
        );
    }),

    lockUser: asyncHandler(async (req, res) => {
        const lockUserRequest = new LockUserRequest(req.body);
        const response = await userServices.lockUser(lockUserRequest);
        return res.status(200).json(new ApiResponse(response));
    }),

    unLockUser: asyncHandler(async (req, res) => {
        const unLockUserRequest = new UnLockUserRequest(req.body);
        const response = await userServices.unLockUser(unLockUserRequest);
        return res.status(200).json(new ApiResponse(response));
    }),
}

module.exports = userController;