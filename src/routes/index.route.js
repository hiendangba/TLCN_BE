const express = require("express");
const router = express.Router();
const authRouter = require("./auth/auth.route");
const buildingRouter = require("./client/building.route");
router.use("/auth", authRouter);
router.use("/buildings", buildingRouter);
module.exports = router;