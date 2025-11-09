const Joi = require("joi");

const singleMeterReadingSchema = Joi.object({
    roomId: Joi.string()
        .uuid({ version: ['uuidv4', 'uuidv1'] })
        .required()
        .messages({
            "string.guid": "roomId phải là UUID hợp lệ",
            "any.required": "Không được bỏ trống roomId",
        }),

    type: Joi.string()
        .valid("water", "electricity")
        .required()
        .messages({
            "any.only": "Loại hóa đơn chỉ có thể là 'water' hoặc 'electric'",
            "string.base": "Loại phải là chuỗi",
            "any.required": "Không được bỏ trống loại hóa đơn"
        }),

    oldValue: Joi.number()
        .precision(2) // cho phép float có tối đa 2 chữ số sau dấu thập phân
        .min(1)
        .positive()
        .required()
        .messages({
            "number.base": "Chỉ số cũ phải là số thực",
            "number.min": "Chỉ số cũ phải lớn hơn hoặc bằng 1",
            "number.positive": "Chỉ số cũ phải là số dương",
            "any.required": "Không được bỏ trống chỉ số cũ"
        }),

    newValue: Joi.number()
        .precision(2)
        .min(1)
        .positive()
        .greater(Joi.ref('oldValue')) // optional: đảm bảo newValue > oldValue
        .required()
        .messages({
            "number.base": "Chỉ số mới phải là số thực",
            "number.min": "Chỉ số mới phải lớn hơn hoặc bằng 1",
            "number.positive": "Chỉ số mới phải là số dương",
            "number.greater": "Chỉ số mới phải lớn hơn chỉ số cũ",
            "any.required": "Không được bỏ trống chỉ số mới"
        }),

    unitPrice: Joi.number()
        .precision(0) // decimal nhưng không cần phần thập phân
        .min(1)
        .positive()
        .required()
        .messages({
            "number.base": "Đơn giá phải là số",
            "any.required": "Không được bỏ trống đơn giá",
            "number.min": "Đơn giá phải lớn hơn hoặc bằng 1",
            "number.positive": "Đơn giá phải là số dương",
        }),
});


const createMeterReadingValidation = Joi.object({
  period: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .required()
    .messages({
      "string.pattern.base": "Kỳ (period) phải có định dạng YYYY-MM, ví dụ: 2025-10",
      "any.required": "Không được bỏ trống kỳ (period)",
    }),

  listMeterReading: Joi.array()
    .items(singleMeterReadingSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "Danh sách meterReading phải là mảng",
      "array.min": "Phải có ít nhất 1 meterReading",
      "any.required": "Không được bỏ trống danh sách meterReading",
    }),
});

module.exports = { createMeterReadingValidation } ;
