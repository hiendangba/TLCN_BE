const Joi = require("joi");

const createHealthCheckValidation = Joi.object({
        healthCheckId: Joi.string()
            .uuid({
                version: ['uuidv4', 'uuidv1']
            })
            .messages({
                "string.guid": "ID đợt khám phải là UUID hợp lệ.",
            }),

        buildingId: Joi.string()
            .uuid({
                version: ['uuidv4', 'uuidv1']
            })
            .required()
            .messages({
                "string.guid": "ID tòa nhà phải là UUID hợp lệ.",
                "any.required": "Không được bỏ trống ID tòa nhà.",
            }),

        title: Joi.string()
            .trim()
            .min(3)
            .max(255)
            .required()
            .messages({
                "string.base": "Tên đợt khám phải là chuỗi.",
                "string.empty": "Tên đợt khám không được bỏ trống.",
                "string.min": "Tên đợt khám phải có ít nhất {#limit} ký tự.",
                "string.max": "Tên đợt khám không được vượt quá {#limit} ký tự.",
                "any.required": "Không được bỏ trống tên đợt khám."
            }),

        description: Joi.string()
            .allow(null, "")
            .max(2000)
            .messages({
                "string.base": "Mô tả cho đợt khám phải là chuỗi.",
                "string.max": "Mô tả cho đợt khám không được vượt quá {#limit} ký tự."
            }),

        startDate: Joi.date()
            .iso()
            .required()
            .messages({
                "date.base": "Ngày bắt đầu khám phải là một ngày hợp lệ.",
                "date.format": "Ngày bắt đầu khám phải ở định dạng ISO (ví dụ: 2025-11-04T10:00:00Z).",
                "date.isoDate": "Ngày bắt đầu khám phải ở định dạng ISO.",
                "any.required": "Không được bỏ trống Ngày bắt đầu khám."
            }),

        endDate: Joi.date()
            .iso()
            .required()
            .greater(Joi.ref("startDate"))
            .messages({
                "date.base": "Ngày kết thúc khám phải là một ngày hợp lệ.",
                "date.format": "Ngày kết thúc khám phải ở định dạng ISO (ví dụ: 2025-11-04T10:00:00Z).",
                "date.isoDate": "Ngày kết thúc khám phải ở định dạng ISO.",
                "any.required": "Không được bỏ trống Ngày kết thúc khám.",
                "date.greater": "Ngày kết thúc phải lớn hơn Ngày bắt đầu khám."
            }),

        capacity: Joi.number()
            .integer()
            .min(1)
            .required()
            .messages({
                "number.base": "Số lượng người tham gia phải là một số nguyên.",
                "number.integer": "Số lượng người tham gia phải là số nguyên.",
                "number.min": "Số lượng người tham gia phải lớn hơn hoặc bằng {#limit}.",
                "any.required": "Không được bỏ trống Số lượng người tham gia."
            }),

        price: Joi.number()
            .precision(2)
            .min(1)
            .required()
            .messages({
                "number.base": "Chi phí phải là một số.",
                "number.precision": "Chi phí chỉ được tối đa {#limit} chữ số thập phân.",
                "number.min": "Chi phí phải lớn hơn hoặc bằng {#limit}.",
                "any.required": "Không được bỏ trống Chi phí."
            }),

        registrationStartDate: Joi.date()
            .iso()
            .required()
            .messages({
                "date.base": "Ngày mở đăng ký đợt khám phải là một ngày hợp lệ.",
                "date.format": "Ngày mở đăng ký đợt khám  phải ở định dạng ISO (ví dụ: 2025-11-04T10:00:00Z).",
                "date.isoDate": "Ngày mở đăng ký đợt khám  phải ở định dạng ISO.",
                "any.required": "Không được bỏ trống Ngày mở đăng ký đợt khám ."
            }),

        registrationEndDate: Joi.date()
            .iso()
            .required()
            .greater(Joi.ref("registrationStartDate"))
            .messages({
                "date.base": "Ngày kết thúc đăng ký đợt khám phải là một ngày hợp lệ.",
                "date.format": "Ngày kết thúc đăng ký đợt khám phải ở định dạng ISO (ví dụ: 2025-11-04T10:00:00Z).",
                "date.isoDate": "Ngày kết thúc đăng ký đợt khám phải ở định dạng ISO.",
                "any.required": "Không được bỏ trống Ngày kết thúc đăng ký đợt khám.",
                "date.greater": "Ngày kết thúc đăng ký đợt khám phải lớn hơn Ngày mở đăng ký đợt khám."
            }),

        status: Joi.string()
            .valid('active', 'inactive')
            .messages({
                "any.only": "Trạng thái chỉ được là 'active' hoặc 'inactive'.",
                "any.required": "Không được bỏ trống Trạng thái."
            }),
    })
    .custom((value, helpers) => {
        const {
            registrationStartDate,
            registrationEndDate,
            startDate,
            endDate
        } = value;


        if (registrationStartDate >= startDate) {
            return helpers.error("any.invalid", {
                message: "Ngày bắt đầu đăng ký phải nhỏ hơn ngày bắt đầu khám."
            });
        }


        if (registrationEndDate >= startDate) {
            return helpers.error("any.invalid", {
                message: "Ngày kết thúc đăng ký phải nhỏ hơn ngày bắt đầu khám."
            });
        }

        if (registrationStartDate >= endDate) {
            return helpers.error("any.invalid", {
                message: "Ngày bắt đầu đăng ký phải nhỏ hơn ngày kết thúc khám."
            });
        }

        
        if (registrationEndDate >= endDate) {
            return helpers.error("any.invalid", {
                message: "Ngày kết thúc đăng ký phải nhỏ hơn ngày kết thúc khám."
            });
        }

        return value;
    }, "registration vs startDate validation");

const getHealthCheck = Joi.object({
    startDate: Joi.date()
        .iso()
        .messages({
            "date.base": "Ngày bắt đầu khám phải là một ngày hợp lệ.",
            "date.format": "Ngày bắt đầu khám phải phải ở định dạng ISO.",
            "date.isoDate": "Ngày bắt đầu khám phải phải ở định dạng ISO.",
        }),

    endDate: Joi.alternatives().conditional("startDate", {
        is: Joi.exist(),
        then: Joi.date().iso().greater(Joi.ref("startDate")).messages({
            "date.base": "Ngày kết thúc khám phải là một ngày hợp lệ.",
            "date.format": "Ngày kết thúc khám phải ở định dạng ISO.",
            "date.isoDate": "Ngày kết thúc khám phải ở định dạng ISO.",
            "date.greater": "Ngày kết thúc khám phải lớn hơn startDate.",
        }),
        otherwise: Joi.date().iso().messages({
            "date.base": "Ngày kết thúc khám phải là một ngày hợp lệ.",
            "date.format": "Ngày kết thúc khám phải ở định dạng ISO.",
            "date.isoDate": "Ngày kết thúc khám phải ở định dạng ISO.",
        }),
    }),

    status: Joi.string()
        .valid('active', 'inactive')
        .allow("") // cho phép chuỗi rỗng
        .messages({
            "any.only": "Trạng thái chỉ được là 'active' hoặc 'inactive'.",
        }),

    availableForRegistration: Joi.boolean()
        .messages({
            "boolean.base": "availableForRegistration phải là true hoặc false.",
        }),

    page: Joi.number()
        .integer()
        .min(1)
        .messages({
            "number.base": "page phải là số.",
            "number.integer": "page phải là số nguyên.",
            "number.min": "page phải lớn hơn hoặc bằng 1.",
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .messages({
            "number.base": "limit phải là số.",
            "number.integer": "limit phải là số nguyên.",
            "number.min": "limit phải lớn hơn hoặc bằng 1.",
            "number.max": "limit không được vượt quá 100.",
        }),
});


const registerHealthCheck = Joi.object({
    healthCheckId: Joi.string()
        .uuid({
            version: ['uuidv4', 'uuidv1']
        })
        .required()
        .messages({
            "string.guid": "ID đợt khám phải là UUID hợp lệ.",
            "any.required": "Không được bỏ trống ID đợt khám.",
        }),

    registerDate: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "Thời gian đăng ký khám phải là một ngày hợp lệ.",
            "date.format": "Thời gian đăng ký khám phải ở định dạng ISO (ví dụ: 2025-11-04T10:00:00Z).",
            "date.isoDate": "Thời gian đăng ký khám phải ở định dạng ISO.",
            "any.required": "Không được bỏ trống Thời gian đăng ký khám."
        }),

    note: Joi.string()
        .allow(null, "")
        .max(2000)
        .messages({
            "string.base": "note phải là chuỗi.",
            "string.max": "note không được vượt quá {#limit} ký tự."
        }),
});


const getRegisterHealthCheck = Joi.object({
    page: Joi.number()
        .integer()
        .required()
        .messages({
            "number.base": "page phải là số.",
            "number.integer": "page phải là số nguyên.",
            "any.required": "Không được bỏ trống page.",
        }),
    limit: Joi.number()
        .integer()
        .required()
        .messages({
            "number.base": "limit phải là số.",
            "number.integer": "limit phải là số nguyên.",
            "any.required": "Không được bỏ trống limit.",
        }),
    keyword: Joi.string()
        .allow(null, "")
        .max(50)
        .messages({
            "string.base": "keyword phải là chuỗi.",
            "string.max": "keyword không được vượt quá {#limit} ký tự."
        }),
});


module.exports = {
    createHealthCheckValidation,
    getHealthCheck,
    registerHealthCheck,
    getRegisterHealthCheck,
};