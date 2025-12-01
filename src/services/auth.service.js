const { User, Student, Admin, Face } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redisClient = require("../utils/redisClient");
const UserError = require("../errors/UserError");
const AuthError = require("../errors/AuthError");
const roomRegistrationServices = require("./roomRegistration.service")
const { StudentStatus } = require("../dto/request/auth.request")
const { CreateRoomRegistrationRequest } = require("../dto/request/roomRegistration.request")
const { sequelize } = require('../config/database');
const generateOTP = require("../utils/generateOTP")
const { nanoid } = require('nanoid');
const sendMail = require('../utils/mailer')
const { Op } = require("sequelize");
const { getDescriptorFromUrl, recognizeFace, createLabeled } = require('./faceDetection.service');
let transaction;
const authServices = {

    register: async (registerAccountRequest) => {
        try {
            transaction = await sequelize.transaction();
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

            const user = await User.create(registerAccountRequest, { transaction });

            const descriptor = await getDescriptorFromUrl(registerAccountRequest.avatar);
            const face = await Face.create({ descriptor: JSON.stringify(descriptor) });
            const student = await Student.create({
                userId: user.id,
                mssv: registerAccountRequest.mssv,
                school: registerAccountRequest.school,
                faceId: face.id
            }, { transaction });

            const createRoomRegistrationRequest = new CreateRoomRegistrationRequest(registerAccountRequest, student.id);
            await roomRegistrationServices.createRoomRegistration(createRoomRegistrationRequest, transaction);
            await transaction.commit();

            return user;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    registerAdmin: async (registerAccountAdminRequest) => {
        const existsEmail = await User.findOne({
            where: { email: registerAccountAdminRequest.email }
        });

        const existsIdentification = await User.findOne({
            where: { identification: registerAccountAdminRequest.identification }
        });

        const existsPhone = await User.findOne({
            where: { phone: registerAccountAdminRequest.phone }
        });

        if (existsEmail) {
            throw UserError.EmailExists();
        }

        if (existsIdentification) {
            throw UserError.IdentificationExists();
        }

        if (existsPhone) {
            throw UserError.PhoneExists();
        }

        registerAccountAdminRequest.email = registerAccountAdminRequest.email.toLowerCase().trim();
        registerAccountAdminRequest.password = await bcrypt.hash("123456", 10);
        const user = await User.create(registerAccountAdminRequest);
        await Admin.create({
            userId: user.id
        })
        return user;
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

            if (user.status === StudentStatus.REGISTERED) {
                throw AuthError.NotApproved();
            }

            const isStudent = await Student.findOne({
                where: { userId: user.id },
            });

            const isAdmin = await Admin.findOne({
                where: { userId: user.id },
            });


            let role, roleId;
            if (isStudent) {
                role = "student";
                roleId = isStudent.id;
            }

            if (isAdmin) {
                role = "admin";
                roleId = isAdmin.id;
            }

            const access_token = jwt.sign(
                {
                    id: user.id,
                    role: role,
                    roleId: roleId
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES }
            );

            const refresh_token = jwt.sign(
                {
                    id: user.id,
                    role: role,
                    roleId: roleId
                },
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

    loginFace: async (file) => {
        try {
            const users = await User.findAll({
                where: {
                    avatar: { [Op.ne]: null },
                    status: { [Op.in]: [StudentStatus.APPROVED_CHANGED, StudentStatus.APPROVED_NOT_CHANGED] },
                },
                attributes: ['id', 'avatar'],
                include: {
                    model: Student,
                    include: {
                        model: Face
                    }
                }
            });
            const labeledDescriptors = await createLabeled(users)
            if (!labeledDescriptors.length) {
                throw AuthError.NoDataRecognizeFace();
            }
            const faceMatches = await recognizeFace(file.buffer, labeledDescriptors);
            const firstFace = faceMatches?.[0];
            if (!firstFace || !firstFace.userId) {
                throw AuthError.FaceNotRecognized();
            }

            const userId = firstFace.userId;

            const isStudent = await Student.findOne({
                where: { userId: userId },
            });

            const isAdmin = await Admin.findOne({
                where: { userId: userId },
            });


            let role, roleId;
            if (isStudent) {
                role = "student";
                roleId = isStudent.id;
            }

            if (isAdmin) {
                role = "admin";
                roleId = isAdmin.id;
            }

            const access_token = jwt.sign(
                {
                    id: userId,
                    role: role,
                    roleId: roleId
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES }
            );

            const refresh_token = jwt.sign(
                {
                    id: userId,
                    role: role,
                    roleId: roleId
                },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: process.env.JWT_REFRESH_EXPIRES }
            );

            await redisClient.set(
                `refresh:${userId}`,
                refresh_token,
                "EX",
                7 * 24 * 60 * 60 // 7 ngày
            );
            return { id: userId, access_token, refresh_token };
        } catch (err) {
            throw err;
        }
    },

    forgotPassword: async (forgotPasswordRequest) => {
        try {
            const user = await User.findOne({
                where: {
                    identification: forgotPasswordRequest.identification,
                    email: forgotPasswordRequest.email,
                    status: StudentStatus.APPROVED_CHANGED
                }
            })
            const flowId = nanoid(24);
            if (!user) {
                return { flowId };
            }

            const otp = generateOTP();
            const otpHashed = await bcrypt.hash(otp, parseInt(process.env.OTP_SALT));
            const key = `fp:flow:${flowId}`;
            await redisClient.set(
                key,
                JSON.stringify({
                    userId: user.id,
                    otpHashed: otpHashed,
                    attempts: 0,
                    maxAttempts: 3,
                    resendCount: 0,
                    maxResends: 3
                }),
                { EX: 600 }
            );

            await sendMail({
                to: user.email,
                subject: "Mã OTP xác minh từ RoomLink – Không chia sẻ cho bất kỳ ai!",
                html: `
                <h3>Xin chào ${user.name},</h3>

                <p>Bạn vừa yêu cầu đặt lại mật khẩu tại <b>RoomLink</b>.</p>

                <p>Mã OTP của bạn là:</p>
                <h2 style="color:#2b6cb0;letter-spacing:2px;">${otp}</h2>

                <p>Mã này có hiệu lực trong <b>10 phút</b>.</p>

                <br/>
                <p>Trân trọng,<br/><b>Đội ngũ RoomLink</b></p>
            `,
            });

            return { flowId };
        } catch (err) {
            throw err;
        }
    },

    resendOTP: async (resendOTPRequest) => {
        try {
            const key = `fp:flow:${resendOTPRequest.flowId}`;
            const raw = await redisClient.get(key);
            if (!raw)
                throw UserError.InvalidFlowId();

            let data;
            try {
                data = JSON.parse(raw);
            } catch (err) {
                await redisClient.del(key);
                throw UserError.InvalidFlowData();
            }

            const requiredFields = ["userId", "otpHashed", "attempts", "maxAttempts", "resendCount", "maxResends"];
            for (const field of requiredFields) {
                if (data[field] === undefined) {
                    await redisClient.del(key);
                    throw UserError.InvalidFlowData();
                }
            }

            if (data.resendCount >= data.maxResends) {
                await redisClient.del(key);
                throw UserError.OtpResendMaxAttempt();
            }

            const user = await User.findOne({ where: { id: data.userId } });
            if (!user) {
                throw UserError.UserNotFound();
            }
            const otp = generateOTP();
            const otpHashed = await bcrypt.hash(otp, parseInt(process.env.OTP_SALT));

            data.resendCount += 1;
            data.otpHashed = otpHashed;
            data.attempts = 0;

            await sendMail({
                to: user.email,
                subject: "RoomLink - Gửi lại mã OTP xác thực",
                html: `
                    <p>Xin chào <b>${user.name}</b>,</p>
                    <p>Chúng tôi đã nhận được yêu cầu <b>gửi lại mã OTP</b> của bạn.</p>
                    <p>Mã OTP mới của bạn là:</p>
                    <h2 style="color:#2b6cb0;letter-spacing:2px;">${otp}</h2>
                    <p>Mã OTP này sẽ hết hạn trong <b>10 phút</b>.  
                    Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                    <p>Nếu bạn không yêu cầu gửi lại mã OTP, hãy bỏ qua email này.</p>
                    <p>Trân trọng,<br>
                    <b>Đội ngũ RoomLink</b></p>
                `,
            });
            await redisClient.set(key, JSON.stringify(data), { EX: 600 });
            return { message: "Gửi lại mã OTP thành công" };
        } catch (err) {
            throw err;
        }
    },

    verifyOTP: async (verifyOTPRequest) => {
        try {
            const key = `fp:flow:${verifyOTPRequest.flowId}`;
            const raw = await redisClient.get(key);

            if (!raw)
                throw UserError.InvalidFlowId();

            let data;
            try {
                data = JSON.parse(raw);
            } catch (err) {
                await redisClient.del(key);
                throw UserError.InvalidFlowData();
            }

            const requiredFields = ["userId", "otpHashed", "attempts", "maxAttempts", "resendCount", "maxResends"];
            for (const field of requiredFields) {
                if (data[field] === undefined) {
                    await redisClient.del(key);
                    throw UserError.InvalidFlowData();
                }
            }

            if (data.attempts >= data.maxAttempts) {
                throw UserError.OtpMaxAttempt();
            }

            const ok = await bcrypt.compare(verifyOTPRequest.otp, data.otpHashed);
            if (!ok) {
                data.attempts += 1;
                await redisClient.set(key, JSON.stringify(data), { EX: 600 });
                throw UserError.OtpIncorrect();
            }

            await redisClient.del(key);

            const resetToken = jwt.sign(
                { id: data.userId, purpose: "reset_password" },
                process.env.JWT_SECRET,
                { expiresIn: "10m" }
            );

            return { resetToken, message: "Xác thực OTP thành công." };
        }
        catch (err) {
            throw err;
        }
    },

    resetPassword: async (resetPasswordRequest) => {
        try {
            if (resetPasswordRequest.payload.purpose != "reset_password")
                throw UserError.InvalidResetTokenPurpose();
            console.log(resetPasswordRequest.payload)
            const passHashed = await bcrypt.hash(resetPasswordRequest.newPassword, parseInt(process.env.OTP_SALT));

            await User.update(
                { password: passHashed },
                { where: { id: resetPasswordRequest.payload.id } }
            );

            return { message: "Đặt lại mật khẩu thành công!" };
        }
        catch (err) {
            throw err;
        }
    },

    refreshToken: async (refreshToken) => {
        try {
            if (!refreshToken) {
                throw UserError.NoHaveToken();
            }
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const savedToken = await redisClient.get(`refresh:${decoded.id}`);

            if (!savedToken || savedToken !== refreshToken) {
                throw new AppError(UserError.REFRESH_TOKEN_INVALID);
            }
            const newAccessToken = jwt.sign(
                { id: decoded.id, role: decoded.role, roleId: decoded.roleId },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES }
            );

            return { access_token: newAccessToken }
        }
        catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                throw UserError.TokenExpired();
            }

            if (err instanceof jwt.JsonWebTokenError) {
                throw UserError.TokenInvalid();
            }

            throw err;
        }
    },

    logout: async (refreshToken) => {
        try {
            if (!refreshToken) {
                throw UserError.NoHaveToken();
            }

            const decoded = jwt.decode(refreshToken);

            if (!decoded || !decoded.id) {
                return { message: "Đăng xuất thành công" };
            }

            const key = `refresh:${decoded.id}`;
            const savedToken = await redisClient.get(key);

            if (!savedToken || savedToken !== refreshToken) {
                return { message: "Đăng xuất thành công" };
            }

            await redisClient.del(key);

            return { message: "Đăng xuất thành công" };

        } catch (err) {
            throw err;
        }
    }

};
module.exports = authServices;