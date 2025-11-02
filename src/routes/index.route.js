const express = require("express");
const router = express.Router();
const authRouter = require("./auth/auth.route");
const buildingRouter = require("./client/building.route");
const floorRouter = require("./client/floor.route");
const roomRouter = require("./client/room.route");
const roomRegistrationRouter = require("./client/roomRegistration.route");

router.use("/auth", authRouter);
router.use("/buildings", buildingRouter);
router.use("/floors", floorRouter);
router.use("/rooms", roomRouter);
router.use("/room-registrations", roomRegistrationRouter);
module.exports = router;