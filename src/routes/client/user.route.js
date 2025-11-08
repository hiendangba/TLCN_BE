const express = require("express");
const userRouter = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const validateRequest = require("../../middlewares/validateRequest");
const userController = require("../../controllers/user.controller")
const { userChangePasswordSchema } = require("../../validations/user.validation")
userRouter.get("/", authMiddleware, userController.getUser);
userRouter.patch("/change-password", authMiddleware, validateRequest(userChangePasswordSchema), userController.changePassword)
userRouter.patch("/", authMiddleware, validateRequest(userChangePasswordSchema), userController.changePassword)

module.exports = userRouter;
