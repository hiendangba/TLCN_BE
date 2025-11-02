const Joi = require("joi");

const createBuildingSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.empty": "Tên tòa nhà không được để trống",
            "string.min": "Tên tòa nhà phải có ít nhất 3 ký tự",
            "string.max": "Tên tòa nhà không được vượt quá 100 ký tự",
        }),

    genderRestriction: Joi.string()
        .valid("male", "female", "all")
        .required()
        .messages({
            "any.only": "Giới hạn giới tính chỉ có thể là 'male', 'female' hoặc 'all'",
        }),
});

module.exports = { createBuildingSchema };