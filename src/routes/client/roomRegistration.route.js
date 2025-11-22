const express = require("express");
const roomRegistrationRouter = express.Router();
const { authMiddleware, isAdmin } = require("../../middlewares/auth.middleware");
const roomRegistrationController = require("../../controllers/roomRegistration.controller")
const validateRequest = require("../../middlewares/validateRequest");
const { approveRoomRegistrationSchema, rejectRoomRegistrationSchema, cancelRoomRegistrationSchema } = require("../../validations/roomRegistration.validation")
roomRegistrationRouter.get("/", authMiddleware, isAdmin, roomRegistrationController.getRoomRegistration);
roomRegistrationRouter.patch("/", authMiddleware, isAdmin, validateRequest(approveRoomRegistrationSchema), roomRegistrationController.approveRoomRegistration);
roomRegistrationRouter.delete("/reject", authMiddleware, isAdmin, validateRequest(rejectRoomRegistrationSchema), roomRegistrationController.rejectRoomRegistration);
roomRegistrationRouter.delete("/cancel", authMiddleware, validateRequest(cancelRoomRegistrationSchema), roomRegistrationController.cancelRoomRegistration);

module.exports = roomRegistrationRouter;
