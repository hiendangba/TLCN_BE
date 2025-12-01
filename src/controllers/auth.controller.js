const authServices = require("../services/auth.service");
const asyncHandler = require('express-async-handler');
const { RegisterAccountRequest, RegisterAccountAdminRequest, LoginRequest, ForgotPasswordRequest, ResendOTPRequest, VerifyOTPRequest, ResetPasswordRequest } = require("../dto/request/auth.request")
const { CheckCCCDResponse, CheckAvatarResponse, RegisterAccountResponse, LoginResponse, ForgotPasswordResponse } = require("../dto/response/auth.response");
const ApiResponse = require("../dto/response/api.response");
const UserError = require("../errors/UserError");
const { hasFace } = require('../services/faceDetection.service');
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
    const faceDetected = await hasFace(req.file.path);

    if (!faceDetected) {
      throw UserError.NoFaceDetected();
    }
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

  registerAdmin: asyncHandler(async (req, res) => {
    const registerAccountAdminRequest = new RegisterAccountAdminRequest(req.body);
    const response = await authServices.registerAdmin(registerAccountAdminRequest);
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
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    });
    const loginResponse = new LoginResponse(response)

    return res.status(200).json(
      new ApiResponse(loginResponse)
    );
  }),


  loginFace: asyncHandler(async (req, res) => {
    if (!req.file) {
      throw UserError.NoImageUpload();
    }
    const response = await authServices.loginFace(req.file);
    res.cookie('refresh_token', response.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    });
    const loginResponse = new LoginResponse(response)

    return res.status(200).json(
      new ApiResponse(loginResponse)
    );
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    const forgotPasswordRequest = new ForgotPasswordRequest(req.body);
    const response = await authServices.forgotPassword(forgotPasswordRequest);
    const forgotPasswordResponse = new ForgotPasswordResponse(response)
    return res.status(202).json(
      new ApiResponse(forgotPasswordResponse)
    );
  }),

  resendOTP: asyncHandler(async (req, res) => {
    const resendOTPRequest = new ResendOTPRequest(req.body);
    const response = await authServices.resendOTP(resendOTPRequest);
    return res.status(202).json(
      new ApiResponse(response)
    );
  }),

  verifyOTP: asyncHandler(async (req, res) => {
    const verifyOTPRequest = new VerifyOTPRequest(req.body);
    const response = await authServices.verifyOTP(verifyOTPRequest);
    res.cookie('resetPassword_token', response.resetToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000
    })
    return res.status(202).json(
      new ApiResponse(response.message)
    );
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const resetPasswordRequest = new ResetPasswordRequest(req.body, req.resetPayload);
    const response = await authServices.resetPassword(resetPasswordRequest);
    res.clearCookie('resetPassword_token');
    return res.status(202).json(
      new ApiResponse(response.message)
    );
  }),

  refreshToken: asyncHandler(async (req, res) => {
    const response = await authServices.refreshToken(req.cookies.refresh_token);
    return res.status(202).json(
      new ApiResponse(response)
    );
  }),

  logout: asyncHandler(async (req, res) => {
    const response = await authServices.logout(req.cookies.refresh_token);
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/"
    });
    return res.status(202).json(
      new ApiResponse(response)
    );
  }),

};

module.exports = authController;