const Joi = require("joi");

const PaymentRequestSchema = Joi.object({
    paymentId: Joi.string()
        .uuid({ version: 'uuidv4'})
        .required()
        .messages({
            "string.guid": "ID của hóa đơn phải là UUID hợp lệ",
            "any.required" : "Không được bỏ trống ID của hóa đơn"
        })
});

module.exports = {
    PaymentRequestSchema,
}