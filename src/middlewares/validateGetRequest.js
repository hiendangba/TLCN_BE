const validateRequestget = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query, { abortEarly: false });
        if (error) {
            const messages = error.details.map(d => d.message.replace(/"/g, '').trim());
            console.log(messages);
            return next(new AppError(messages, 400, "VALIDATION_ERROR"));
        }
        next();
    };
};

module.exports = validateRequestget;