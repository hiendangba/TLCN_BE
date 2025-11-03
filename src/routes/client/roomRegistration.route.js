const express = require("express");
const roomRegistrationRouter = express.Router();
const { authMiddleware, isAdmin } = require("../../middlewares/auth.middleware");
const validateRequest = require("../../middlewares/validateRequest");
const roomRegistrationController = require("../../controllers/roomRegistration.controller")
roomRegistrationRouter.get("/", authMiddleware, isAdmin, roomRegistrationController.getRoomRegistration);

module.exports = roomRegistrationRouter;
