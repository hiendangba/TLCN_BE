const authServices = require("../services/auth.service");
const { RegisterRequest } = require("../dto/request/auth.request");

const authController = {
  register: async (req, res) => {
      try {
        const registerRequest = new RegisterRequest(req.body);
//        const result = await authServices.register(registerRequest);
//        const registerResponse = new RegisterResponse(result);
//        res.status(201).json(registerResponse);
      } catch (err) {
//        res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
      }
  },
};

module.exports = authController;