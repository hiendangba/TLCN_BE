const express = require("express");
const buildingRouter = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const  validateRequest  = require("../../middlewares/validateRequest");
const { createBuildingSchema } = require("../../validations/building.validation")

const buildingController = require("../../controllers/building.controller");
buildingRouter.post("/", authMiddleware, validateRequest(createBuildingSchema), buildingController.createBuilding);
buildingRouter.get("/",buildingController.getBuilding);
module.exports = buildingRouter;
