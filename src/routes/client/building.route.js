const express = require("express");
const buildingRouter = express.Router();
const { authMiddleware, isAdmin } = require("../../middlewares/auth.middleware");
const validateRequest = require("../../middlewares/validateRequest");
const { createBuildingSchema } = require("../../validations/building.validation")

const buildingController = require("../../controllers/building.controller");
buildingRouter.post("/", authMiddleware, isAdmin, validateRequest(createBuildingSchema), buildingController.createBuilding);
buildingRouter.delete("/:id", authMiddleware, isAdmin, buildingController.deleteBuilding);
buildingRouter.get("/get", buildingController.getBuildingByGenderRestriction);
buildingRouter.get("/", authMiddleware, isAdmin, buildingController.getBuilding);
module.exports = buildingRouter;
