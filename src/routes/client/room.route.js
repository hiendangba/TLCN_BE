const express = require("express");
const roomRouter = express.Router();
const { authMiddleware, isAdmin } = require("../../middlewares/auth.middleware");
const validateRequest = require("../../middlewares/validateRequest");
const { createRoomTypeSchema, createRoomSchema, roomUpdateSchema, updateRoomTypeSchema} = require("../../validations/room.validation")
const roomController = require("../../controllers/room.controller");
roomRouter.post("/", authMiddleware, isAdmin, validateRequest(createRoomSchema), roomController.createRoom);
roomRouter.get("/", roomController.getRoom);
roomRouter.get("/admin", authMiddleware, isAdmin, roomController.getRoomForAdmin);
roomRouter.post("/room-type", authMiddleware, isAdmin, validateRequest(createRoomTypeSchema), roomController.createRoomType);
roomRouter.get("/room-type", roomController.getRoomType);
roomRouter.get("/room-type/admin", authMiddleware, isAdmin, roomController.getRoomTypeForAdmin);
roomRouter.get("/active", authMiddleware, roomController.getRoomByUser);
roomRouter.get("/history", authMiddleware, roomController.getRoomHistoryByUser);
roomRouter.put("/:id", authMiddleware, isAdmin, validateRequest(roomUpdateSchema), roomController.updateRoom);
roomRouter.delete("/:id", authMiddleware, isAdmin, roomController.deleteRoom);
roomRouter.delete("/room-type/:id", authMiddleware, isAdmin, roomController.deleteRoomType);
roomRouter.put("/room-type/:id", authMiddleware, isAdmin, validateRequest(updateRoomTypeSchema), roomController.updateRoomType);

module.exports = roomRouter;
