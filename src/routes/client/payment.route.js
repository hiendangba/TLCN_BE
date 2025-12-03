const express = require("express");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const validateRequest = require('../../middlewares/validateRequest');
const validateRequestget = require("../../middlewares/validateGetRequest");
const { PaymentRequestSchema, GetPaymentSchema, GetRevenueSchema  } = require("../../validations/payment.validation");
const paymentController = require("../../controllers/payment.controller");
const paymentRoute = express.Router();

paymentRoute.post("/getPaymentUrl", authMiddleware, validateRequest(PaymentRequestSchema), paymentController.getPaymentUrl);
paymentRoute.get("/checkPayment", paymentController.checkPayment);
paymentRoute.get("/getPayment", authMiddleware, validateRequestget(GetPaymentSchema), paymentController.getPayment);
paymentRoute.get("/revenue", authMiddleware, validateRequestget(GetRevenueSchema), paymentController.getRevenue);

module.exports = paymentRoute;