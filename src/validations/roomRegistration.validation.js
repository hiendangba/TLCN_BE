const Joi = require("joi");

const approveRoomRegistrationSchema = Joi.object({
    id: Joi.string()
        .uuid()
        .required(),
});
module.exports = { approveRoomRegistrationSchema };
