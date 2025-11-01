const { User, Student, Admin } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redisClient = require("../utils/redisClient");
const UserError = require("../errors/UserError");
const AuthError = require("../errors/AuthError");


const authServices = {
    register: async (registerAccountRequest) => {
        try {
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
            await Student.create({
                userId: user.id,
                mssv: registerAccountRequest.mssv,
                school: registerAccountRequest.school
            });
            return user;
        } catch (err) {
            throw err;
        }
    },

    login: async (loginRequest) => {
        try {
            const user = await User.findOne({
                where: { identification: loginRequest.identification },
            });
            if (!user) {
                throw AuthError.AuthenticationFailed();
            }
            const passwordMatch = await bcrypt.compare(loginRequest.password, user.password);
            if (!passwordMatch) {
                throw AuthError.AuthenticationFailed();
            }

            const access_token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES }
            );

            const refresh_token = jwt.sign(
                { id: user.id, },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: process.env.JWT_REFRESH_EXPIRES }
            );

            await redisClient.set(
                `refresh:${user.id}`,
                refresh_token,
                "EX",
                7 * 24 * 60 * 60 // 7 ngày
            );
            return { id: user.id, access_token, refresh_token };
        } catch (err) {
            throw err;
        }
    },
};
module.exports = authServices;