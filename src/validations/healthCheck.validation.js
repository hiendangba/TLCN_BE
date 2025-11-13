const Joi = require("joi");

const createHealthCheckValidation = Joi.object({
        healthCheckId: Joi.string()
            .uuid({
                version: ['uuidv4', 'uuidv1']
            })
            .messages({
                "string.guid": "healthCheckId phải là UUID hợp lệ",
            }),

        buildingId: Joi.string()
            .uuid({
                version: ['uuidv4', 'uuidv1']
            })
            .required()
            .messages({
                "string.guid": "buildingId phải là UUID hợp lệ",
                "any.required": "Không được bỏ trống buildingId",
            }),

        title: Joi.string()
            .trim()
            .min(3)
            .max(255)
            .required()
            .messages({
                "string.base": "Title phải là chuỗi.",
                "string.empty": "Title không được bỏ trống.",
                "string.min": "Title phải có ít nhất {#limit} ký tự.",
                "string.max": "Title không được vượt quá {#limit} ký tự.",
                "any.required": "Không được bỏ trống Title."
            }),

        description: Joi.string()
            .allow(null, "")
            .max(2000)
            .messages({
                "string.base": "Description phải là chuỗi.",
                "string.max": "Description không được vượt quá {#limit} ký tự."
            }),

        startDate: Joi.date()
            .iso()
            .required()
            .messages({
                "date.base": "startDate phải là một ngày hợp lệ.",
                "date.format": "startDate phải ở định dạng ISO (ví dụ: 2025-11-04T10:00:00Z).",
                "date.isoDate": "startDate phải ở định dạng ISO.",
                "any.required": "Không được bỏ trống startDate."
            }),

        endDate: Joi.date()
            .iso()
            .required()
            .greater(Joi.ref("startDate"))
            .messages({
                "date.base": "endDate phải là một ngày hợp lệ.",
                "date.format": "endDate phải ở định dạng ISO (ví dụ: 2025-11-04T10:00:00Z).",
                "date.isoDate": "endDate phải ở định dạng ISO.",
                "any.required": "Không được bỏ trống endDate.",
                "date.greater": "endDate phải lớn hơn startDate."
            }),

        capacity: Joi.number()
            .integer()
            .min(1)
            .required()
            .messages({
                "number.base": "Capacity phải là một số nguyên.",
                "number.integer": "Capacity phải là số nguyên.",
                "number.min": "Capacity phải lớn hơn hoặc bằng {#limit}.",
                "any.required": "Không được bỏ trống Capacity."
            }),

        price: Joi.number()
            .precision(2)
            .min(1)
            .required()
            .messages({
                "number.base": "Price phải là một số.",
                "number.precision": "Price chỉ được tối đa {#limit} chữ số thập phân.",
                "number.min": "Price phải lớn hơn hoặc bằng {#limit}.",
                "any.required": "Không được bỏ trống Price."
            }),

        registrationStartDate: Joi.date()
            .iso()
            .required()
            .messages({
                "date.base": "registrationStartDate phải là một ngày hợp lệ.",
                "date.format": "registrationStartDate phải ở định dạng ISO (ví dụ: 2025-11-04T10:00:00Z).",
                "date.isoDate": "registrationStartDate phải ở định dạng ISO.",
                "any.required": "Không được bỏ trống registrationStartDate."
            }),

        registrationEndDate: Joi.date()
            .iso()
            .required()
            .greater(Joi.ref("registrationStartDate"))
            .messages({
                "date.base": "registrationEndDate phải là một ngày hợp lệ.",
                "date.format": "registrationEndDate phải ở định dạng ISO (ví dụ: 2025-11-04T10:00:00Z).",
                "date.isoDate": "registrationEndDate phải ở định dạng ISO.",
                "any.required": "Không được bỏ trống registrationEndDate.",
                "date.greater": "registrationEndDate phải lớn hơn registrationStartDate."
            }),

        status: Joi.string()
            .valid('active', 'inactive')
            .messages({
                "any.only": "Status chỉ được là 'active' hoặc 'inactive'.",
                "any.required": "Không được bỏ trống status."
            }),
    })
    .custom((value, helpers) => {
        const {
            registrationStartDate,
            registrationEndDate,
            startDate
        } = value;


        if (registrationStartDate >= startDate) {
            return helpers.error("any.invalid", {
                message: "registrationStartDate phải nhỏ hơn startDate."
            });
        }


        if (registrationEndDate >= startDate) {
            return helpers.error("any.invalid", {
                message: "registrationEndDate phải nhỏ hơn startDate."
            });
        }

        return value;
    }, "registration vs startDate validation");

const getHealthCheck = Joi.object({
    startDate: Joi.date()
        .iso()
        .messages({
            "date.base": "startDate phải là một ngày hợp lệ.",
            "date.format": "startDate phải ở định dạng ISO.",
            "date.isoDate": "startDate phải ở định dạng ISO.",
        }),

    endDate: Joi.alternatives().conditional("startDate", {
        is: Joi.exist(),
        then: Joi.date().iso().greater(Joi.ref("startDate")).messages({
            "date.base": "endDate phải là một ngày hợp lệ.",
            "date.format": "endDate phải ở định dạng ISO.",
            "date.isoDate": "endDate phải ở định dạng ISO.",
            "date.greater": "endDate phải lớn hơn startDate.",
        }),
        otherwise: Joi.date().iso().messages({
            "date.base": "endDate phải là một ngày hợp lệ.",
            "date.format": "endDate phải ở định dạng ISO.",
            "date.isoDate": "endDate phải ở định dạng ISO.",
        }),
    }),
});


const registerHealthCheck = Joi.object({
    healthCheckId: Joi.string()
        .uuid({
            version: ['uuidv4', 'uuidv1']
        })
        .required()
        .messages({
            "string.guid": "healthCheckId phải là UUID hợp lệ",
            "any.required": "Không được bỏ trống healthCheckId",
        }),

    registerDate: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "registerDate phải là một ngày hợp lệ.",
            "date.format": "registerDate phải ở định dạng ISO (ví dụ: 2025-11-04T10:00:00Z).",
            "date.isoDate": "registerDate phải ở định dạng ISO.",
            "any.required": "Không được bỏ trống registerDate."
        }),

    note: Joi.string()
        .allow(null, "")
        .max(2000)
        .messages({
            "string.base": "note phải là chuỗi.",
            "string.max": "note không được vượt quá {#limit} ký tự."
        }),
});

module.exports = {
    createHealthCheckValidation,
    getHealthCheck,
    registerHealthCheck
};