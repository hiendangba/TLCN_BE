const express = require("express");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const validateRequest = require('../../middlewares/validateRequest');
const { PaymentRequestSchema } = require("../../validations/payment.validation");
const paymentController = require("../../controllers/payment.controller");
const paymentRoute = express.Router();

paymentRoute.post("/getPayment", authMiddleware, validateRequest(PaymentRequestSchema), paymentController.getPayment );
module.exports = paymentRoute;