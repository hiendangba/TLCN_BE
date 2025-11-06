const express = require("express");
const router = express.Router();
const authRouter = require("./auth/auth.route");
const buildingRouter = require("./client/building.route");
const floorRouter = require("./client/floor.route");
const roomRouter = require("./client/room.route");
const MeterReadingRouter = require("./admin/meterReading.route");
const healthCheckRoute = require("../routes/admin/healthCheck.route");

router.use("/auth", authRouter);
router.use("/buildings", buildingRouter);
router.use("/floors", floorRouter);
router.use("/rooms", roomRouter);
router.use("/meterReading", MeterReadingRouter);
router.use("/healthCheck", healthCheckRoute);

module.exports = router;