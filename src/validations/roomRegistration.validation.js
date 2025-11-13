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

module.exports = { approveRoomRegistrationSchema };
