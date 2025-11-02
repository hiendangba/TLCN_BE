const Joi = require("joi");

const createFloorSchema = Joi.object({
    number: Joi.number()
        .integer()
        .min(1)
        .max(20)
        .required()
        .messages({
            "number.base": "Số tầng phải là số",
            "number.min": "Số tầng phải lớn hơn hoặc bằng 1",
            "number.max": "Số tầng phải nhỏ hơn hoặc bằng 20",
        }),

    buildingId: Joi.string()
        .uuid({ version: 'uuidv4' })
        .required()
        .messages({
            "string.guid": "buildingId phải là UUID hợp lệ",
        }),

});

module.exports = { createFloorSchema };
