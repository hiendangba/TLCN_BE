const express = require("express");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const meterReadingMiddleware = require("../../middlewares/validateMeterReading.middleware");
const validateRequestget = require("../../middlewares/validateGetRequest");
const { createMeterReadingValidation, getMeterReadingValidation } = require("../../validations/meterReading.validation");
const meterReadingController = require("../../controllers/meterReading.controller");
const MeterReadingRouter = express.Router();


MeterReadingRouter.post("/createMeterReading", authMiddleware, meterReadingMiddleware(createMeterReadingValidation), meterReadingController.createMeterReading);
MeterReadingRouter.get("/getMeterReading", authMiddleware, validateRequestget(getMeterReadingValidation), meterReadingController.getMeterReading);
module.exports = MeterReadingRouter;
