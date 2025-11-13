const express = require("express");
const roomRegistrationRouter = express.Router();
const { authMiddleware, isAdmin } = require("../../middlewares/auth.middleware");
const roomRegistrationController = require("../../controllers/roomRegistration.controller")
const validateRequest = require("../../middlewares/validateRequest");
const { approveRoomRegistrationSchema, rejectRoomRegistrationSchema, deleteRoomRegistrationSchema } = require("../../validations/roomRegistration.validation")
roomRegistrationRouter.get("/", authMiddleware, isAdmin, roomRegistrationController.getRoomRegistration);
roomRegistrationRouter.patch("/", authMiddleware, isAdmin, validateRequest(approveRoomRegistrationSchema), roomRegistrationController.approveRoomRegistration);
roomRegistrationRouter.delete("/reject", authMiddleware, isAdmin, validateRequest(rejectRoomRegistrationSchema), roomRegistrationController.rejectRoomRegistration);
roomRegistrationRouter.delete("/delete", authMiddleware, isAdmin, validateRequest(approveRoomRegistrationSchema), roomRegistrationController.approveRoomRegistration);

module.exports = roomRegistrationRouter;
