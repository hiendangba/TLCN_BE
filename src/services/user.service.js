const { User, Student } = require("../models");
const bcrypt = require("bcryptjs");
const { StudentStatus } = require("../dto/request/auth.request")

const userServices = {
    getUser: async (getUserRequest) => {
        try {
            const user = await User.findOne({
                where: { id: getUserRequest.userId }
            })

            let student;
            if (getUserRequest.role === "student") {
                student = await Student.findOne({
                    where: { id: getUserRequest.roleId }
                })
            }

            const data = { ...user.toJSON(), ...student?.toJSON(), role: getUserRequest.role };
            return data;
        } catch (err) {
            throw err;
        }
    },

    changePassword: async (changePasswordRequest) => {
        try {
            const user = await User.findOne({
                where: { id: changePasswordRequest.userId }
            })
            const hashedPassword = await bcrypt.hash(changePasswordRequest.password, 10);
            await user.update({ password: hashedPassword });
            if (user.status === StudentStatus.APPROVED_NOT_CHANGED) {
                await user.update({ status: StudentStatus.APPROVED_CHANGED })
            }
            return { message: "Đổi mật khẩu thành công" };
        } catch (err) {
            throw err;
        }
    },
};
module.exports = userServices;