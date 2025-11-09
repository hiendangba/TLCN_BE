const Joi = require("joi");

const createNumberPlateSchema = Joi.object({
    number: Joi.string()
        .pattern(/^[0-9A-Z\s.-]+$/i)
        .min(6)
        .max(15)
        .required()
        .messages({
            "string.empty": "Biển số xe không được để trống.",
            "string.pattern.base": "Biển số xe chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang hoặc dấu chấm.",
            "string.min": "Biển số xe phải có ít nhất 6 ký tự.",
            "string.max": "Biển số xe không được vượt quá 15 ký tự.",
        }),
});
module.exports = { createNumberPlateSchema };
