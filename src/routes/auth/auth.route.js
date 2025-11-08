const express = require("express");
const authRouter = express.Router();
const { uploadCCCD, uploadAvatar } = require("../../middlewares/upload.middleware");
const authController = require("../../controllers/auth.controller");
const validateRequest = require("../../middlewares/validateRequest");
const { userRegisterSchema, adminRegisterSchema, userLoginSchema } = require("../../validations/user.validation")
const { authMiddleware, isAdmin } = require("../../middlewares/auth.middleware");

authRouter.post("/register", validateRequest(userRegisterSchema), authController.register);
authRouter.post("/register-admin",validateRequest(adminRegisterSchema), authController.registerAdmin);
authRouter.post("/login", validateRequest(userLoginSchema), authController.login);
authRouter.post("/checkCCCD", uploadCCCD.single("CCCD"), authController.checkCCCD);
authRouter.post("/checkAvatar", uploadAvatar.single("Avatar"), authController.checkAvatar);
module.exports = authRouter;
