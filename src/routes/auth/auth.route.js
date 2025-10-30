const express = require("express");
const authRouter = express.Router();
const { uploadCCCD, uploadAvatar } = require("../../middlewares/upload.middleware");
const authController = require("../../controllers/auth.controller");
const validateRequest = require("../../middlewares/validateRequest");
const { userRegisterSchema } = require("../../validations/user.validation")
authRouter.post("/register", validateRequest(userRegisterSchema), authController.register);
authRouter.post("/checkCCCD", uploadCCCD.single("CCCD"), authController.checkCCCD);
authRouter.post("/checkAvatar", uploadAvatar.single("Avatar"), authController.checkAvatar);
module.exports = authRouter;
