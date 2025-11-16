const asyncHandler = require('express-async-handler');
const { PaymentRequest } = require("../dto/request/payment.request");
const { GetPaymentReponse } = require("../dto/response/payment.reponse");
const paymentService = require("../services/payment.service")
const ApiResponse = require("../dto/response/api.response");

const paymentController = {
    getPayment: asyncHandler(async(req, res) => {
        const userId = req.userId;
        const paymentRequest = new PaymentRequest(req.body);
        const reponse = await paymentService.getPayment(userId, paymentRequest);
        const getPaymentReponse = new GetPaymentReponse(reponse);   
        return res.status(200).json(
            new ApiResponse(getPaymentReponse)
        );
    })
};

module.exports = paymentController;