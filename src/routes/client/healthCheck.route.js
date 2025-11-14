const express = require("express");
const healthCheckRoute = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const validateRequest = require('../../middlewares/validateRequest');
const validateRequestget = require("../../middlewares/validateGetRequest");
const { createHealthCheckValidation, getHealthCheck, registerHealthCheck, getRegisterHealthCheck } = require("../../validations/healthCheck.validation");
const healthCheckController = require("../../controllers/healthCheck.controller");
healthCheckRoute.post("/createHealthCheck", authMiddleware, validateRequest(createHealthCheckValidation), healthCheckController.createHealthCheck);
healthCheckRoute.get("/getHealthCheck", authMiddleware, validateRequestget(getHealthCheck), healthCheckController.getHealthCheck);
healthCheckRoute.post("/registerHealthCheck", authMiddleware, validateRequest(registerHealthCheck), healthCheckController.registerHealthCheck);
healthCheckRoute.delete("/deleteHealthCheck/:id", authMiddleware, healthCheckController.deleteHealthCheck);
healthCheckRoute.get("/getRegisterHealthCheck", authMiddleware, validateRequestget(getRegisterHealthCheck), healthCheckController.getRegisterHealthCheck);

module.exports = healthCheckRoute;  