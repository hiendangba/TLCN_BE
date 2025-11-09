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

const createRoomSchema = Joi.object({
    roomNumber: Joi.string()
        .min(1)
        .max(20)
        .required()
        .messages({
            "string.empty": "Số phòng không được để trống",
            "string.min": "Số phòng phải có ít nhất 1 ký tự",
            "string.max": "Số phòng không được quá 20 ký tự",
        }),

    capacity: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            "number.base": "Sức chứa phải là một số",
            "number.integer": "Sức chứa phải là số nguyên",
            "number.min": "Sức chứa phải lớn hơn hoặc bằng 1",
        }),

    monthlyFee: Joi.number()
        .precision(2)
        .min(0)
        .required()
        .messages({
            "number.base": "Phí hàng tháng phải là một số",
            "number.min": "Phí hàng tháng phải lớn hơn hoặc bằng 0",
        }),

    floorId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "floorId phải là UUID hợp lệ",
        }),

    roomTypeId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "roomTypeId phải là UUID hợp lệ",
        }),

});

module.exports = { createRoomTypeSchema, createRoomSchema };
