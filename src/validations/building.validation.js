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
        .valid("male", "female")
        .required()
        .messages({
            "any.only": "Giới hạn giới tính chỉ có thể là 'male', 'female'",
        }),

    numberFloor: Joi.number()
        .integer()
        .positive()
        .min(1)
        .max(20)
        .required()
        .messages({
            "number.base": "Số tầng phải là một số",
            "number.integer": "Số tầng phải là số nguyên",
            "number.positive": "Số tầng phải lớn hơn 0",
            "number.min": "Tòa nhà phải có ít nhất 1 tầng",
            "number.max": "Tòa nhà không được vượt quá 20 tầng",
            "any.required": "Vui lòng nhập số tầng của tòa nhà"
        }),

    roomTypeIds: Joi.array()
        .items(Joi.string().uuid().messages({
            "string.guid": "Mỗi ID loại phòng phải là một UUID hợp lệ",
        }))
        .min(1)
        .required()
        .messages({
            "array.base": "Danh sách ID loại phòng phải là một mảng",
            "array.min": "Phải chọn ít nhất 1 loại phòng"

        }),
});
module.exports = { createBuildingSchema };