const asyncHandler = require('express-async-handler');
const ApiResponse = require("../dto/response/api.response");
const { CreateHealthCheckRequest, GetHealthCheck, RegisterHealthCheck, GetRegisterHealthCheckRequest } = require("../dto/request/healthCheck.request");
const { HealthCheckResponse, RegisterHealthCheckReponse  } = require("../dto/response/healthCheck.response");
const healthCheckService = require("../services/healthCheck.service");

const healthCheckController = {
    getRegisterHealthCheck: asyncHandler(async (req, res) => {
        const getRegisterHealthCheckRequest = new GetRegisterHealthCheckRequest (req.query);
        const { totalItems , response } = await healthCheckService.getRegisterHealthCheck(getRegisterHealthCheckRequest);
        const registerHealthCheckReponse = response.map( item => new RegisterHealthCheckReponse(item) );
        return res.status(200).json(
            new ApiResponse(            
                registerHealthCheckReponse,
                {
                    page: getRegisterHealthCheckRequest.page,
                    limit: getRegisterHealthCheckRequest.limit,
                    totalItems : totalItems,
                }
            )
        )
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
        const { data, totalItems } = await healthCheckService.getHealthCheck(getHealthCheckRequest);
        const healthCheckResponses = data.map ( item => new HealthCheckResponse(item) );
        return res.status(200).json(
            new ApiResponse(
                healthCheckResponses,
                {
                    page: getHealthCheckRequest.page,
                    limit: getHealthCheckRequest.limit,
                    totalItems: totalItems,
                }
            )
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

    cancelRegisterHealthCheck: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { id } = req.params;
        
        const result = await healthCheckService.cancelRegisterHealthCheck(id, userId);

        return res.status(200).json(
            new ApiResponse(result)
        );
    }),

    deleteHealthCheck: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.userId;

        const result = await healthCheckService.deleteHealthCheck(id, userId);

        return res.status(200).json(
            new ApiResponse(result)
        );
    }),

    getHealthCheckById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const response = await healthCheckService.getHealthCheckById(id);
        const healthCheckResponse = new HealthCheckResponse(response);
        return res.status(200).json(
            new ApiResponse(healthCheckResponse)
        );
    })
}

module.exports = healthCheckController