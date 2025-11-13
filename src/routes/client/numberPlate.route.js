const express = require("express");
const numberPlateRouter = express.Router();
const { authMiddleware, isAdmin } = require("../../middlewares/auth.middleware");
const { uploadNumberPlate } = require("../../middlewares/upload.middleware");

const validateRequest = require("../../middlewares/validateRequest");
const { createNumberPlateSchema, approvedNumberPlateSchema, rejectNumberPlateSchema } = require("../../validations/numberPlate.validation")
const numberPlateController = require("../../controllers/numberPlate.controller");
numberPlateRouter.post("/", authMiddleware, uploadNumberPlate.single("numberPlate"), validateRequest(createNumberPlateSchema), numberPlateController.createNumberPlate);
numberPlateRouter.get("/", numberPlateController.getNumberPlate);
numberPlateRouter.patch("/", authMiddleware, isAdmin, validateRequest(approvedNumberPlateSchema), numberPlateController.approvedNumberPlate);
numberPlateRouter.delete("/reject", authMiddleware, isAdmin, validateRequest(rejectNumberPlateSchema), numberPlateController.rejectNumberPlate);
module.exports = numberPlateRouter;
