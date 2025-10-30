const { Student } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redisClient = require("../utils/redisClient");
const UserError = require("../errors/UserError");



const authServices = {
    register: async (registerAccountRequest) => {
        try {
            console.log(Student);
            const existsEmail = await Student.findOne({
                where: { email: registerAccountRequest.email }
            });

            const existsMssv = await Student.findOne({
                where: { mssv: registerAccountRequest.mssv }
            });

            const existsPhone = await Student.findOne({
                where: { phone: registerAccountRequest.phone }
            });

            if (existsEmail) {
                throw UserError.EmailExists();
            }

            if (existsMssv) {
                throw UserError.MSSVExists();
            }

            if (existsPhone) {
                throw UserError.PhoneExists();
            }
            registerAccountRequest.email = registerAccountRequest.email.toLowerCase().trim();
            registerAccountRequest.password = await bcrypt.hash("123456", 10);
            const response = await Student.create(registerAccountRequest);
            return response;
        } catch (err) {
            throw err;
        }
    },
};
module.exports = authServices;