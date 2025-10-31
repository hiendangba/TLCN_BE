const Joi = require("joi");

// Schema validate dữ liệu user khi đăng ký
const userRegisterSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty": "Họ tên không được để trống",
            "string.min": "Họ tên phải ít nhất 2 ký tự",
            "string.max": "Họ tên không được quá 50 ký tự",
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.empty": "Email không được để trống",
            "string.email": "Email không hợp lệ",
        }),

    identification: Joi.string()
        .length(12)
        .required()
        .messages({
            "string.empty": "CCCD không được để trống",
            "string.length": "CCCD phải đủ 12 số",
        }),

    dob: Joi.date()
        .less("now")
        .required()
        .messages({
            "date.base": "Ngày sinh không hợp lệ",
            "date.less": "Ngày sinh phải nhỏ hơn ngày hiện tại",
        }),

    gender: Joi.string()
        .valid("male", "female", "other")
        .required()
        .messages({
            "any.only": "Giới tính phải là male, female hoặc other",
        }),

    phone: Joi.string()
        .pattern(/^(0)\d{9}$/)
        .required()
        .messages({
            "string.pattern.base": "Số điện thoại không hợp lệ",
            "string.empty": "Số điện thoại không được để trống",
        }),

    nation: Joi.string().required().messages({
        "string.empty": "Quốc tịch không được để trống",
    }),

    apostate: Joi.string().required().messages({
        "string.empty": "Tôn giáo không được để trống",
    }),

    address: Joi.string().required().messages({
        "string.empty": "Địa chỉ không được để trống",
    }),
    mssv: Joi.string().required(),
    school: Joi.string().required(),
    frontIdentificationImage: Joi.string().required(),
    avatar: Joi.string().required(),
});

const userLoginSchema = Joi.object({
    identification: Joi.string()
        .length(12)
        .required()
        .messages({
            "string.empty": "CCCD không được để trống",
            "string.length": "CCCD phải đủ 12 số",
        }),
    password: Joi.string().min(6).required()
});

module.exports = {
    userRegisterSchema,
    userLoginSchema
};