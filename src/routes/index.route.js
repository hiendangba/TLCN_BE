const express = require("express");
const router = express.Router();
const authRouter = require("./auth/auth.route");
const buildingRouter = require("./client/building.route");
const floorRouter = require("./client/floor.route");
const roomRouter = require("./client/room.route");
const MeterReadingRouter = require("./client/meterReading.route");
const healthCheckRoute = require("./client/healthCheck.route");
const roomRegistrationRouter = require("./client/roomRegistration.route");
const userRouter = require("./client/user.route")
const numberPlateRouter = require("./client/numberPlate.route")
const paymentRouter = require("./client/payment.route");
const renewalRouter = require("./client/renewal.route");
router.use("/auth", authRouter);
router.use("/buildings", buildingRouter);
router.use("/floors", floorRouter);
router.use("/rooms", roomRouter);
router.use("/meterReading", MeterReadingRouter);
router.use("/healthCheck", healthCheckRoute);
router.use("/room-registrations", roomRegistrationRouter);
router.use("/number-plate", numberPlateRouter)
router.use("/user", userRouter)
router.use("/payment", paymentRouter);
router.use("/renewals", renewalRouter)
module.exports = router;