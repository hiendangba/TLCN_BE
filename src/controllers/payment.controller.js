const asyncHandler = require('express-async-handler');
const { PaymentRequest, GetPaymentByUserId } = require("../dto/request/payment.request");
const { GetPaymentReponse, PaymentReponse  } = require("../dto/response/payment.reponse");
const paymentService = require("../services/payment.service")
const ApiResponse = require("../dto/response/api.response");
const { stackTraceLimit } = require('../errors/AppError');

const paymentController = {
    getPayment: asyncHandler(async (req, res) => {
        const getPaymentRequest = new GetPaymentByUserId(req.query);
        const roleId = req.roleId;
        const role = req.role;
        const { totalItems , response } = await paymentService.getPayment(getPaymentRequest, roleId, role);
        const listPaymentResponse = response.map( item => new PaymentReponse(item) );
        return res.status(200).json(
            new ApiResponse(
                listPaymentResponse,
                {
                    page: getPaymentRequest.page,
                    limit: getPaymentRequest.limit,
                    totalItems
                }
            )
        )
    }),

    getPaymentUrl: asyncHandler(async(req, res) => {
        const userId = req.userId;
        const paymentRequest = new PaymentRequest(req.body);
        const reponse = await paymentService.getPaymentUrl(userId, paymentRequest);
        const getPaymentReponse = new GetPaymentReponse(reponse);   
        return res.status(200).json(
            new ApiResponse(getPaymentReponse)
        );
    }),

    checkPayment: asyncHandler(async(req, res) => {
        const momoResponse = req.query;
        const response = await paymentService.checkPayment(momoResponse);
        const paymentReponse = new PaymentReponse(response);
        return res.status(200).json(
            new ApiResponse(paymentReponse)
        );
    }),

    redirect: asyncHandler(async(req, res) => {
        return res.status(200).json(
            new ApiResponse("Thank for pament!")
        );
    })
};

module.exports = paymentController;