const express = require("express");
const roomRegistrationRouter = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const validateRequest = require("../../middlewares/validateRequest");
const { createRoomTypeSchema, createRoomSchema } = require("../../validations/room.validation")
const roomController = require("../../controllers/room.controller");
roomRegistrationRouter.post("/", authMiddleware, validateRequest(createRoomSchema), roomController.createRoom);
roomRegistrationRouter.get("/", roomController.getRoom);
module.exports = roomRegistrationRouter;
