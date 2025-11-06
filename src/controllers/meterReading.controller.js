const asyncHandler = require('express-async-handler');
const ApiResponse = require("../dto/response/api.response");
const { CreateMeterReading, ItemMeterReading } = require("../dto/request/meterReading.request");
const meterReadingService  = require("../services/meterReading.service");
const { CreateMeterReadingResponse } = require("../dto/response/meterReading.response");

const meterReadingController = {
    createMeterReading: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const createMeterReadingRequest = new CreateMeterReading(req.body);
        createMeterReadingRequest.listMeterReading = createMeterReadingRequest.listMeterReading.map(
            (item) => new ItemMeterReading(item)
        );
        const response = await meterReadingService.createMeterReading(createMeterReadingRequest, userId);
        const createMeterReadings = response.map( r => new CreateMeterReadingResponse(r) );
        return res.status(200).json( 
            new ApiResponse(createMeterReadings)
        );
    }),
}

module.exports = meterReadingController