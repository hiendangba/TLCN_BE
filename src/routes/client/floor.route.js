const express = require("express");
const floorRouter = express.Router();
const { authMiddleware, isAdmin } = require("../../middlewares/auth.middleware");
const validateRequest = require("../../middlewares/validateRequest");
const { createFloorSchema } = require("../../validations/floor.validation")

const floorController = require("../../controllers/floor.controller");
floorRouter.post("/", authMiddleware, isAdmin, validateRequest(createFloorSchema), floorController.createFloor);
floorRouter.get("/", floorController.getFloor);
floorRouter.delete("/:id", authMiddleware, isAdmin, floorController.deleteFloor);

module.exports = floorRouter;
