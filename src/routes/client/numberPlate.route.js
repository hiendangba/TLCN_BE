const express = require("express");
const numberPlateRouter = express.Router();
const { authMiddleware, isAdmin } = require("../../middlewares/auth.middleware");
const { uploadNumberPlate } = require("../../middlewares/upload.middleware");

const validateRequest = require("../../middlewares/validateRequest");
const { createNumberPlateSchema } = require("../../validations/numberPlate.validation")
const numberPlateController = require("../../controllers/numberPlate.controller");
numberPlateRouter.post("/", authMiddleware, uploadNumberPlate.single("numberPlate"), validateRequest(createNumberPlateSchema), numberPlateController.createNumberPlate);
// numberPlateRouter.get("/", floorController.getFloor);
// numberPlateRouter.patch("/", authMiddleware, isAdmin, floorController.deleteFloor);
// numberPlateRouter.delete("/:id", authMiddleware, isAdmin, floorController.deleteFloor);
module.exports = numberPlateRouter;
