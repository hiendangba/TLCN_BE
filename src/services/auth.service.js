const User = require("../models/UserBase");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const sendMail  = require('../utils/mailer');
// const generateOTP = require("../utils/generateOTP");
// const redisClient = require("../utils/redisClient");
// const { nanoid } = require('nanoid');
// const AppError = require("../errors/AppError");
// const UserError = require("../errors/user.error.enum");



const authServices = {
    // register: async (registerRequest) => {
    //     try{
    //         const exists = await User.findOne({ email:registerRequest.email });

    //         const existsMssv = await User.findOne({ mssv:registerRequest.mssv });
            
    //         if (exists) {
    //             throw new AppError(UserError.EMAIL_EXISTS);
    //         }

    //         if (existsMssv) {
    //             throw new AppError(UserError.MSSV_EXISTS);
    //         }
    //         //kiểm tra dữ liệu hợp lệ
    //         authValidation(registerRequest);  
           
    //         // chuẩn hóa email
    //         registerRequest.email = registerRequest.email.toLowerCase().trim();

    //         const otp = generateOTP();
    //         const flowId = nanoid(24); 
    //         const otpHashed = await bcrypt.hash(otp, 10);
    //         const key = `register:flow:${flowId}`;

    //         // Lưu thông tin đăng ký và OTP đã hash vào Redis
    //         await redisClient.set(
    //             key,
    //             JSON.stringify({
    //             user: registerRequest,
    //             otpHashed,
    //             attempts: 0,
    //             maxAttempts: 3,
    //             resendCount: 0,
    //             maxResends: 3
    //             }),
    //             { EX: 600 } // 10 phút
    //         );

    //         await sendMail({
    //             to: registerRequest.email,
    //             subject: "Xác minh đăng ký tài khoản",
    //             html: `
    //             <h3>Xin chào ${registerRequest.name}</h3>
    //             <p>Cảm ơn bạn đã đăng ký tài khoản.</p>
    //             <p>Mã OTP của bạn là: <b>${otp}</b></p>
    //             <p>Mã OTP này sẽ hết hạn trong 10 phút.</p>
    //             `,
    //         });
    //         return { message: "OTP đã được gửi, vui lòng kiểm tra email", flowId,   expiresIn: 600 };
    //     }catch (err){
    //         throw err instanceof AppError ? err : AppError.fromError(err);
    //     }
    // },
};
module.exports = authServices;