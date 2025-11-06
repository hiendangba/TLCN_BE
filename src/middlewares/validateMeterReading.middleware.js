const AppError = require("../errors/AppError");
const Joi = require("joi");

const validateMeterReading = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            presence: "required"
        });

        if (error) {
            const messages = error.details.map((d)=> {
                // Nếu path nằm trong listMeterReading (ví dụ ['listMeterReading', 2, 'roomId'])
                const listIndex = d.path.find((p) => typeof p === "number");
                const message = d.message.replace(/"/g, "").trim();

                if (d.path.includes("listMeterReading") && listIndex !== undefined){
                    return `Dòng ${listIndex + 1} - ${message}`;
                }
                else{
                    return message;
                }  
            });
            
            return next(new AppError(messages, 400, "VALIDATION_ERROR"));
        }
        next();
    }
}

module.exports = validateMeterReading;