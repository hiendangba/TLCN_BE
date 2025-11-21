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
    bankBin: Joi.string()
        .required()
        .messages({
            "string.base": "Bank BIN phải là chuỗi.",
            "any.required": "Bank BIN không được bỏ trống.",
        }),
    bankAccountNumber: Joi.string()
        .required()
        .messages({
            "string.base": "Số tài khoản phải là chuỗi.",
            "any.required": "Số tài khoản không được bỏ trống.",
        }),
    bankName: Joi.string()
        .required()
        .messages({
            "string.base": "Tên ngân hàng phải là chuỗi.",
            "any.required": "Tên ngân hàng không được bỏ trống.",
        }),
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


module.exports = { approveRoomRegistrationSchema, rejectRoomRegistrationSchema, cancelRoomRegistrationSchema };
