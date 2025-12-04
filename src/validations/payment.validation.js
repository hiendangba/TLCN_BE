const Joi = require("joi");

const PaymentRequestSchema = Joi.object({
    paymentId: Joi.string()
        .uuid({
            version: 'uuidv4'
        })
        .required()
        .messages({
            "string.guid": "ID của hóa đơn phải là UUID hợp lệ",
            "any.required": "Không được bỏ trống ID của hóa đơn"
        })
});

const GetRevenueSchema = Joi.object({
    userId: Joi.string()
        .uuid({
            version: 'uuidv4'
        })
        .messages({
            'string.guid': 'ID người dùng phải là UUID hợp lệ'
        }),
    type: Joi.string()
        .valid('WATER', 'ROOM', 'ELECTRICITY', 'HEALTHCHECK')
        .messages({
            'any.only': 'Loại dịch vụ không hợp lệ'
        }),
    startDate: Joi.date()
        .iso()
        .messages({
            'date.format': 'Ngày bắt đầu phải có định dạng ISO hợp lệ'
        }),
    endDate: Joi.date()
        .iso()
        .greater(Joi.ref('startDate'))
        .messages({
            'date.format': 'Ngày kết thúc phải có định dạng ISO hợp lệ',
            'date.greater': 'Ngày kết thúc phải lớn hơn ngày bắt đầu'
        })      
});

const GetPaymentSchema = Joi.object({
    userId: Joi.string()
        .uuid({
            version: ['uuidv4']
        })
        .messages({
            "string.guid": "userId phải là UUID hợp lệ.",
        }),

    type: Joi.string()
        .messages({
            "string.base": "type phải là chuỗi.",
        }),

    page: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            "number.base": "page phải là số.",
            "number.integer": "page phải là số nguyên.",
            "number.min": "page phải lớn hơn hoặc bằng 1.",
            "any.required": "Không được bỏ trống page.",
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            "number.base": "limit phải là số.",
            "number.integer": "limit phải là số nguyên.",
            "number.min": "limit phải lớn hơn hoặc bằng 1.",
            "any.required": "Không được bỏ trống limit.",
        }),
    keyword: Joi.string()
        .allow(null, "")
        .max(50)
        .messages({
            "string.base": "keyword phải là chuỗi.",
            "string.max": "keyword không được vượt quá 50 ký tự."
        }),
    startDate: Joi.date()
        .iso()
        .messages({
            'date.format': 'Ngày bắt đầu phải có định dạng ISO hợp lệ'
        }),
    endDate: Joi.date()
        .iso()
        .greater(Joi.ref('startDate'))
        .messages({
            'date.format': 'Ngày kết thúc phải có định dạng ISO hợp lệ',
            'date.greater': 'Ngày kết thúc phải lớn hơn ngày bắt đầu'
        })        
});

module.exports = {
    PaymentRequestSchema,
    GetPaymentSchema,
    GetRevenueSchema
}