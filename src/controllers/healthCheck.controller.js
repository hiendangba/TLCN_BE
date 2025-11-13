const asyncHandler = require('express-async-handler');
const ApiResponse = require("../dto/response/api.response");
const { CreateHealthCheckRequest, GetHealthCheck, RegisterHealthCheck } = require("../dto/request/healthCheck.request");
const { HealthCheckResponse, RegisterHealthCheckReponse  } = require("../dto/response/healthCheck.response");
const healthCheckService = require("../services/healthCheck.service");

const healthCheckController = {
    getRegisterHealthCheck: asyncHandler(async (req, res) => {

    }),

    createHealthCheck: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const createHealthCheckRequest = new CreateHealthCheckRequest(req.body);
        const response = await healthCheckService.createHealthCheck(createHealthCheckRequest, userId);
        const healthCheckResponse = new HealthCheckResponse(response);
        return res.status(200).json( 
            new ApiResponse(healthCheckResponse)
        ); 
    }),

    getHealthCheck: asyncHandler(async (req, res) => {
        const getHealthCheckRequest = new GetHealthCheck(req.query);
        const response = await healthCheckService.getHealthCheck(getHealthCheckRequest);
        const healthCheckResponses = response.map ( item => new HealthCheckResponse(item) );
        return res.status(200).json(
            new ApiResponse(healthCheckResponses)
        );
    }),

    registerHealthCheck: asyncHandler(async (req, res) => {
        const registerHealthCheckRequest =  new RegisterHealthCheck(req.body);
        const userid = req.userId; 
        const response = await healthCheckService.registerHealthCheck(registerHealthCheckRequest, userid);
        const registerHealthCheckResponse = new RegisterHealthCheckReponse(response);
        return res.status(200).json(
            new ApiResponse(registerHealthCheckResponse)
        );
    }),

    deleteHealthCheck: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.userId;

        const result = await healthCheckService.deleteHealthCheck(id, userId);

        return res.status(200).json(
            new ApiResponse(result)
        );
    })
}

module.exports = healthCheckController