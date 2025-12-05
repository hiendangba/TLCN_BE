const express = require("express");
const userRouter = express.Router();
const { authMiddleware, isAdmin } = require("../../middlewares/auth.middleware");
const validateRequest = require("../../middlewares/validateRequest");
const userController = require("../../controllers/user.controller")
const { userChangePasswordSchema, userUpdateProfileSchema } = require("../../validations/user.validation")
userRouter.get("/", authMiddleware, userController.getUser);
userRouter.patch("/change-password", authMiddleware, validateRequest(userChangePasswordSchema), userController.changePassword)
userRouter.patch("/profile", authMiddleware, validateRequest(userUpdateProfileSchema), userController.updateProfile)
userRouter.get("/all", authMiddleware, isAdmin, userController.getAllUser)
module.exports = userRouter;
