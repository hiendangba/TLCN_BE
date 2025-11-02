const authServices = require("../services/auth.service");
const asyncHandler = require('express-async-handler');
const { RegisterAccountRequest, LoginRequest } = require("../dto/request/auth.request")
const { CheckCCCDResponse, CheckAvatarResponse, RegisterAccountResponse, LoginResponse } = require("../dto/response/auth.response");
const ApiResponse = require("../dto/response/api.response");
const UserError = require("../errors/UserError");
const authController = {
  checkCCCD: asyncHandler(async (req, res) => {
    if (!req.file) {
      throw UserError.NoImageUpload();
    }
    //Gọi modal AI để trích xuất thông tin từ CCCD
    const response = new CheckCCCDResponse(req.file);

    return res.status(201).json(
      new ApiResponse(response)
    );
  }),

  checkAvatar: asyncHandler(async (req, res) => {
    if (!req.file) {
      throw UserError.NoImageUpload();
    }
    //Gọi modal AI để nhận diện có khuôn mặt trong ảnh không

    const response = new CheckAvatarResponse(req.file);

    return res.status(201).json(
      new ApiResponse(response)
    );
  }),

  register: asyncHandler(async (req, res) => {
    const registerAccountRequest = new RegisterAccountRequest(req.body);
    const response = await authServices.register(registerAccountRequest);
    const registerAccountResponse = new RegisterAccountResponse(response)
    return res.status(201).json(
      new ApiResponse(registerAccountResponse)
    );
  }),
  login: asyncHandler(async (req, res) => {
    const loginRequest = new LoginRequest(req.body);
    const response = await authServices.login(loginRequest);
    res.cookie('refresh_token', response.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    });
    const loginResponse = new LoginResponse(response)

    return res.status(200).json(
      new ApiResponse(loginResponse)
    );
  })
};

module.exports = authController;