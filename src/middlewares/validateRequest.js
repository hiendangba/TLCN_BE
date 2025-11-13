const AppError = require("../errors/AppError");

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const messages = error.details.map(d => d.message.replace(/"/g, '').trim());
            return next(new AppError(messages, 400, "VALIDATION_ERROR"));
        }
        next();
    };
};

module.exports =  validateRequest;
