const express = require("express");
const healthCheckRoute = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const { validateRequest, validateRequestget } = require('../../middlewares/validateRequest');
const { createHealthCheckValidation, getHealthCheck, registerHealthCheck }  = require("../../validations/healthCheck.validation");
const healthCheckController = require("../../controllers/healthCheck.controller");
healthCheckRoute.post("/createHealthCheck", authMiddleware, validateRequest(createHealthCheckValidation), healthCheckController.createHealthCheck);
healthCheckRoute.get("/getHealthCheck", authMiddleware, validateRequestget(getHealthCheck), healthCheckController.getHealthCheck);
healthCheckRoute.post("/registerHealthCheck", authMiddleware, validateRequest(registerHealthCheck), healthCheckController.registerHealthCheck);

module.exports = healthCheckRoute;  