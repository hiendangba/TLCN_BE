const { User, Student, Admin } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redisClient = require("../utils/redisClient");
const UserError = require("../errors/UserError");



const authServices = {
    register: async (registerAccountRequest) => {
        try {
            console.log(Student);
            const existsEmail = await User.findOne({
                where: { email: registerAccountRequest.email }
            });

            const existsIdentification = await User.findOne({
                where: { identification: registerAccountRequest.identification }
            });

            const existsPhone = await User.findOne({
                where: { phone: registerAccountRequest.phone }
            });

            const existsMssv = await Student.findOne({
                where: { mssv: registerAccountRequest.mssv }
            });

            if (existsEmail) {
                throw UserError.EmailExists();
            }

            if (existsIdentification) {
                throw UserError.IdentificationExists();
            }

            if (existsMssv) {
                throw UserError.MSSVExists();
            }

            if (existsPhone) {
                throw UserError.PhoneExists();
            }
            registerAccountRequest.email = registerAccountRequest.email.toLowerCase().trim();
            registerAccountRequest.password = await bcrypt.hash("123456", 10);
            const user = await User.create(registerAccountRequest);
            const student = await Student.create({
                userId: user.id,
                mssv: registerAccountRequest.mssv,
                school: registerAccountRequest.school
            });
            return user;
        } catch (err) {
            throw err;
        }
    },
};
module.exports = authServices;