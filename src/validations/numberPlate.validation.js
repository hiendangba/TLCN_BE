const Joi = require("joi");

const createNumberPlateSchema = Joi.object({
    number: Joi.string()
        .pattern(/^[0-9A-Z\s.-]+$/i)
        .min(6)
        .max(15)
        .required()
        .messages({
            "string.empty": "Biển số xe không được để trống.",
            "string.pattern.base": "Biển số xe chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang hoặc dấu chấm.",
            "string.min": "Biển số xe phải có ít nhất 6 ký tự.",
            "string.max": "Biển số xe không được vượt quá 15 ký tự.",
        }),
});


const approvedNumberPlateSchema = Joi.object({
    ids: Joi.array()
        .items(
            Joi.string()
                .uuid()
                .messages({
                    "string.base": "Mỗi ID phải là chuỗi.",
                    "string.guid": "ID không hợp lệ, vui lòng kiểm tra lại.",
                })
        )
        .min(1)
        .required()
        .messages({
            "array.base": "Trường 'ids' phải là một danh sách (array).",
            "array.min": "Phải có ít nhất một ID để duyệt.",
            "any.required": "Thiếu trường 'ids' trong yêu cầu.",
        }),
});


const rejectNumberPlateSchema = Joi.object({
    ids: Joi.array()
        .items(
            Joi.string()
                .uuid()
                .messages({
                    "string.base": "Mỗi ID phải là chuỗi.",
                    "string.guid": "ID không hợp lệ, vui lòng kiểm tra lại.",
                })
        )
        .min(1)
        .required()
        .messages({
            "array.base": "Trường 'ids' phải là một danh sách (array).",
            "array.min": "Phải có ít nhất một ID để từ chối.",
            "any.required": "Thiếu trường 'ids' trong yêu cầu.",
        }),
    reason: Joi.string()
        .allow("")
        .optional()
        .messages({
            "string.base": "Lý do từ chối phải là chuỗi.",
        }),
    reasons: Joi.object()
        .pattern(
            Joi.string().uuid(),
            Joi.string().allow("")
        )
        .optional()
        .messages({
            "object.base": "Lý do từ chối phải là object.",
        }),
});
module.exports = { createNumberPlateSchema, approvedNumberPlateSchema, rejectNumberPlateSchema };
