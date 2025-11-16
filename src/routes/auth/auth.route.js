const express = require("express");
const authRouter = express.Router();
const { uploadCCCD, uploadAvatar } = require("../../middlewares/upload.middleware");
const authController = require("../../controllers/auth.controller");
const validateRequest = require("../../middlewares/validateRequest");
const { userRegisterSchema, adminRegisterSchema, userLoginSchema, userForgotPasswordSchema, userResendOTPSchema, userVerifyOTPSchema, userResetPasswordSchema } = require("../../validations/user.validation")
const { resetPasswordMiddleware } = require("../../middlewares/auth.middleware")

authRouter.post("/register", validateRequest(userRegisterSchema), authController.register);
authRouter.post("/register-admin", validateRequest(adminRegisterSchema), authController.registerAdmin);
authRouter.post("/login", validateRequest(userLoginSchema), authController.login);
authRouter.post("/checkCCCD", uploadCCCD.single("CCCD"), authController.checkCCCD);
authRouter.post("/checkAvatar", uploadAvatar.single("Avatar"), authController.checkAvatar);
authRouter.post("/forgot-password", validateRequest(userForgotPasswordSchema), authController.forgotPassword);
authRouter.post("/resend-otp", validateRequest(userResendOTPSchema), authController.resendOTP);
authRouter.post("/verify-otp", validateRequest(userVerifyOTPSchema), authController.verifyOTP);
authRouter.patch("/reset-password", resetPasswordMiddleware, validateRequest(userResetPasswordSchema), authController.resetPassword);
authRouter.post("/refresh-token", authController.refreshToken);
authRouter.post("/logout", authController.logout);

module.exports = authRouter;
