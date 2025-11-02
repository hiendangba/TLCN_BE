const Joi = require("joi");

const createRoomTypeSchema = Joi.object({
    type: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty": "Tên loại phòng không được để trống",
            "string.min": "Tên loại phòng phải có ít nhất 2 ký tự",
            "string.max": "Tên loại phòng không được quá 50 ký tự",
        }),

    amenities: Joi.array()
        .items(Joi.string().min(1).max(50))
        .required()
        .messages({
            "array.base": "Tiện nghi phải là một mảng",
            "string.min": "Tên tiện nghi phải có ít nhất 1 ký tự",
            "string.max": "Tên tiện nghi không được quá 50 ký tự",
        }),

});

module.exports = { createRoomTypeSchema };
