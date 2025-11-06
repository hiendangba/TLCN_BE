const express = require("express");
const floorRouter = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const { validateRequest } = require("../../middlewares/validateRequest");
const { createFloorSchema } = require("../../validations/floor.validation")

const floorController = require("../../controllers/floor.controller");
floorRouter.post("/", authMiddleware, validateRequest(createFloorSchema), floorController.createFloor);
floorRouter.get("/", floorController.getFloor);
module.exports = floorRouter;
