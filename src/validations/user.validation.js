const Joi = require("joi");

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

    region: Joi.string().required().messages({
        "string.empty": "Tôn giáo không được để trống",
    }),

    address: Joi.string().required().messages({
        "string.empty": "Địa chỉ không được để trống",
    }),
    mssv: Joi.string()
        .required()
        .messages({
            "string.empty": "MSSV không được để trống.",
            "any.required": "Vui lòng nhập MSSV.",
        }),

    school: Joi.string()
        .required()
        .messages({
            "string.empty": "Tên trường không được để trống.",
            "any.required": "Vui lòng nhập tên trường.",
        }),

    frontIdentificationImage: Joi.string()
        .required()
        .messages({
            "string.base": "Ảnh căn cước (mặt trước) phải là chuỗi URL.",
            "string.empty": "Ảnh căn cước mặt trước không được để trống.",
            "any.required": "Vui lòng tải lên ảnh căn cước mặt trước.",
        }),

    avatar: Joi.string()
        .required()
        .messages({
            "string.base": "Ảnh đại diện phải là chuỗi URL.",
            "string.empty": "Ảnh đại diện không được để trống.",
            "any.required": "Vui lòng tải lên ảnh đại diện.",
        }),

    roomSlotId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "roomSlotId phải là UUID hợp lệ",
        }),

    duration: Joi.string().required(),
});

const adminRegisterSchema = Joi.object({
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

    region: Joi.string().required().messages({
        "string.empty": "Tôn giáo không được để trống",
    }),

    address: Joi.string().required().messages({
        "string.empty": "Địa chỉ không được để trống",
    }),

});

const userLoginSchema = Joi.object({
    identification: Joi.string()
        .length(12)
        .required()
        .messages({
            "string.empty": "CCCD không được để trống",
            "string.length": "CCCD phải đủ 12 số",
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            "string.empty": "Mật khẩu không được để trống.",
            "string.min": "Mật khẩu phải có ít nhất 6 ký tự.",
            "any.required": "Vui lòng nhập mật khẩu.",
        })
});

const userChangePasswordSchema = Joi.object({
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            "string.empty": "Mật khẩu không được để trống.",
            "string.min": "Mật khẩu phải có ít nhất 6 ký tự.",
            "any.required": "Vui lòng nhập mật khẩu mới.",
        }),

    confirmPassword: Joi.string()
        .min(6)
        .required()
        .valid(Joi.ref("password"))
        .messages({
            "string.empty": "Mật khẩu xác nhận không được để trống.",
            "string.min": "Mật khẩu xác nhận phải có ít nhất 6 ký tự.",
            "any.required": "Vui lòng nhập mật khẩu xác nhận.",
            "any.only": "Mật khẩu xác nhận không khớp.",
        }),
});

const userForgotPasswordSchema = Joi.object({
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
});

const userResendOTPSchema = Joi.object({
    flowId: Joi.string()
        .length(24)
        .regex(/^[A-Za-z0-9_-]+$/)
        .required()
        .messages({
            "string.empty": "flowId không được để trống",
            "string.length": "flowId không hợp lệ",
            "string.pattern.base": "flowId không đúng định dạng",
            "any.required": "Thiếu flowId",
        })
});

const userVerifyOTPSchema = Joi.object({
    flowId: Joi.string()
        .length(24)
        .regex(/^[A-Za-z0-9_-]+$/)
        .required()
        .messages({
            "string.empty": "flowId không được để trống",
            "string.length": "flowId không hợp lệ",
            "string.pattern.base": "flowId không đúng định dạng",
            "any.required": "Thiếu flowId",
        }),

    otp: Joi.string()
        .length(6)
        .regex(/^[0-9]{6}$/)
        .required()
        .messages({
            "string.empty": "otp không được để trống",
            "string.length": "otp phải gồm 6 ký tự",
            "string.pattern.base": "otp chỉ được chứa số và gồm 6 chữ số",
            "any.required": "Thiếu otp",
        }),

});


const userResetPasswordSchema = Joi.object({
    newPassword: Joi.string()
        .min(6)
        .required()
        .messages({
            "string.empty": "Mật khẩu mới không được để trống",
            "string.min": "Mật khẩu mới phải có ít nhất 6 ký tự",
            "any.required": "Thiếu mật khẩu mới",
        }),

    confirmPassword: Joi.any()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
            "any.only": "Xác nhận mật khẩu không khớp",
            "any.required": "Thiếu xác nhận mật khẩu",
        }),
});

module.exports = {
    userRegisterSchema,
    userLoginSchema,
    adminRegisterSchema,
    userChangePasswordSchema,
    userForgotPasswordSchema,
    userResendOTPSchema,
    userVerifyOTPSchema,
    userResetPasswordSchema
};