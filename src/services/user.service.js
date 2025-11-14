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

    updateProfile: async (updateProfileRequest) => {
        try {
            const user = await User.findOne({ where: { id: updateProfileRequest.userId } });
            if (!user) {
                throw UserError.UserNotFound();
            }
            const allowedFields = ["email", "phone", "nation", "region", "mssv", "school"];
            const updateData = {};

            for (const field of allowedFields) {
                if (updateProfileRequest[field] !== undefined) {
                    updateData[field] = updateProfileRequest[field];
                }
            }

            await User.update(updateData, { where: { id: updateProfileRequest.userId } });
            if (updateData.mssv !== undefined || updateData.school !== undefined) {
                await Student.update(
                    {
                        mssv: updateData.mssv,
                        school: updateData.school
                    },
                    { where: { id: updateProfileRequest.roleId } }
                );
            }

            return { message: "Cập nhật thông tin thành công" };
        } catch (err) {
            throw err;
        }
    },
};
module.exports = userServices;