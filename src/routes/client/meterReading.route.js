const express = require("express");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const meterReadingMiddleware = require("../../middlewares/validateMeterReading.middleware");
const { createMeterReadingValidation } = require("../../validations/meterReading.validation");
const meterReadingController = require("../../controllers/meterReading.controller");
const MeterReadingRouter = express.Router();


MeterReadingRouter.post("/createMeterReading", authMiddleware, meterReadingMiddleware(createMeterReadingValidation), meterReadingController.createMeterReading);
module.exports = MeterReadingRouter;
