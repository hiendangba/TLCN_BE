const express = require("express");
const roomRouter = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const validateRequest = require("../../middlewares/validateRequest");
const { createRoomTypeSchema, createRoomSchema } = require("../../validations/room.validation")
const roomController = require("../../controllers/room.controller");
roomRouter.post("/", authMiddleware, validateRequest(createRoomSchema), roomController.createRoom);
roomRouter.get("/", roomController.getRoom);
roomRouter.post("/room-type", authMiddleware, validateRequest(createRoomTypeSchema), roomController.createRoomType);
roomRouter.get("/room-type", roomController.getRoomType);
module.exports = roomRouter;
