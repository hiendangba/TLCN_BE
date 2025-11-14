const express = require("express");
const floorRouter = express.Router();
const floorController = require("../../controllers/floor.controller");
floorRouter.get("/", floorController.getFloor);
module.exports = floorRouter;
