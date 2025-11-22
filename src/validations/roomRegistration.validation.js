const Joi = require("joi");

const approveRoomRegistrationSchema = Joi.object({
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

const rejectRoomRegistrationSchema = Joi.object({
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

const cancelRoomRegistrationSchema = Joi.object({
    reason: Joi.string()
        .allow("")
        .optional()
        .messages({
            "string.base": "Lý do từ chối phải là chuỗi.",
        }),
    checkoutDate: Joi.date()
        .required()
        .messages({
            "date.base": "Ngày checkout không hợp lệ.",
            "any.required": "Ngày checkout không được bỏ trống.",
        }),
});

const approvedRoomRegistrationSchema = Joi.object({
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

module.exports = { approveRoomRegistrationSchema, rejectRoomRegistrationSchema, cancelRoomRegistrationSchema, approvedRoomRegistrationSchema };
