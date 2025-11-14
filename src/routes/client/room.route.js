const express = require("express");
const roomRouter = express.Router();
const { authMiddleware, isAdmin } = require("../../middlewares/auth.middleware");
const validateRequest = require("../../middlewares/validateRequest");
const { createRoomTypeSchema, createRoomSchema } = require("../../validations/room.validation")
const roomController = require("../../controllers/room.controller");
roomRouter.post("/", authMiddleware, isAdmin, validateRequest(createRoomSchema), roomController.createRoom);
roomRouter.get("/", roomController.getRoom);
roomRouter.get("/admin", authMiddleware, isAdmin, roomController.getRoomForAdmin);
roomRouter.post("/room-type", authMiddleware, isAdmin, validateRequest(createRoomTypeSchema), roomController.createRoomType);
roomRouter.get("/room-type", roomController.getRoomType);
roomRouter.get("/room-type/admin", authMiddleware, isAdmin, roomController.getRoomTypeForAdmin);

module.exports = roomRouter;
