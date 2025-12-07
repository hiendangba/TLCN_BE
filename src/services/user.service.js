const { User, Student, RoomRegistration, CancellationInfo, RoomSlot, Room } = require("../models");
const bcrypt = require("bcryptjs");
const { StudentStatus } = require("../dto/request/auth.request");
const UserError = require("../errors/UserError");
const { Op } = require("sequelize");

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
            const hashedPassword = await bcrypt.hash(changePasswordRequest.password, process.env.OTP_SALT);
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
                const student = await Student.findOne({
                    where: { mssv: updateData.mssv }
                })
                if (student && student.id != updateProfileRequest.roleId) {
                    throw UserError.MSSVExists();
                } else {
                    await Student.update(
                        {
                            mssv: updateData.mssv,
                            school: updateData.school
                        },
                        { where: { id: updateProfileRequest.roleId } }
                    );
                }
            }
            return { message: "Cập nhật thông tin thành công" };
        } catch (err) {
            throw err;
        }
    },

    getAllUser: async (getAllUserRequest) => {
        try {
            const {
                page,
                limit,
                keyword,
                status,
                startDate,
                endDate
            } = getAllUserRequest;

            const offset = (page - 1) * limit;

            const dateCondition = (startDate && endDate)
                ? {
                    "$RoomRegistrations.approvedDate$": {
                        [Op.gte]: startDate,
                        [Op.lte]: endDate
                    }
                }
                : {};

            let statusCondition = {};
            switch (status) {
                case "Locked":
                    statusCondition = { "$User.status$": StudentStatus.LOCKED };
                    break;
                case "UnLocked":
                    statusCondition = { "$User.status$": { [Op.in]: [StudentStatus.APPROVED_CHANGED, StudentStatus.APPROVED_NOT_CHANGED] } };
                    break;
                case "All":
                default:
                    statusCondition = { "$User.status$": { [Op.in]: [StudentStatus.LOCKED, StudentStatus.APPROVED_CHANGED, StudentStatus.APPROVED_NOT_CHANGED] } };
                    break;
            }


            const students = await Student.findAndCountAll({
                where: {
                    ...statusCondition,
                    ...dateCondition
                },
                include: [
                    {
                        model: User,
                    },
                    {
                        model: RoomRegistration,
                        where: {
                            status: {
                                [Op.in]: ["CONFIRMED", "MOVE_PENDING", "CANCELED", "EXTENDING"]
                            }
                        },
                        include: [
                            {
                                model: CancellationInfo,
                                required: false,
                                attributes: ['refundStatus'],
                                where: {
                                    refundStatus: 'PENDING'
                                },
                            },
                            {
                                model: RoomSlot,
                                include: [
                                    {
                                        model: Room,
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            const filteredStudents = keyword
                ? students.rows.filter(s =>
                    s.User.name.includes(keyword) ||
                    s.User.identification.includes(keyword) ||
                    s.mssv.includes(keyword) ||
                    s.RoomRegistrations.some(
                        r =>
                            r.RoomSlot?.Room?.roomNumber &&
                            r.RoomSlot.Room.roomNumber.includes(keyword)
                    )
                )
                : students.rows;

            const totalApproved = filteredStudents.filter(s => s.User.status === StudentStatus.LOCKED).length;
            const pagingStudent = filteredStudents.slice(offset, offset + limit);
            return {
                totalApproved,
                totalUnapproved: filteredStudents.length - totalApproved,
                totalItems: filteredStudents.length,
                response: pagingStudent,
            };
        } catch (err) {
            throw err;
        }
    },

    lockUser: async (lockUserRequest) => {
        const { ids, reasons } = lockUserRequest;
        try {
            const users = await User.findAll({
                where: {
                    id: ids,
                    status: {
                        [Op.in]: [
                            StudentStatus.APPROVED_CHANGED,
                            StudentStatus.APPROVED_NOT_CHANGED
                        ]
                    }
                }
            })

            if (users.length === 0) {
                throw UserError.UserNotFound();
            }

            const approvedList = [];
            const skippedList = [];
            const emailTasks = [];

            for (const user of users) {
                try {
                    await user.update({
                        status: StudentStatus.LOCKED
                    });


                    const reasonText = reasons[user.id] || "Hành vi không phù hợp với quy định.";

                    emailTasks.push(
                        sendMail({
                            to: user.email,
                            subject: "Tài khoản Ký túc xá của bạn đã bị khóa",
                            html: `
                            <h3>Xin chào ${user.name},</h3>
                            <p>Tài khoản của bạn tại hệ thống Ký túc xá đã bị <strong>khóa</strong>.</p>
                            <p><strong>Lý do:</strong> ${reasonText}</p>
                            <p>Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ ban quản lý để được hỗ trợ.</p>
                            <p>Trân trọng,<br/>Ban Quản Lý Ký Túc Xá</p>
                        `,
                        })
                    );
                    approvedList.push(user.id);
                }
                catch (innerErr) {
                    skippedList.push({
                        id: user.id,
                        reason: innerErr.message || "Lỗi không xác định",
                    });
                }
            }
            await Promise.allSettled(emailTasks);
            return { approvedList, skippedList };
        } catch (err) {
            throw err;
        }
    },

    unLockUser: async (unLockUserRequest) => {
        try {
            const users = await User.findAll({
                where: {
                    id: unLockUserRequest.ids,
                    status: StudentStatus.LOCKED
                }
            })

            if (users.length === 0) {
                throw UserError.UserNotFound();
            }

            const approvedList = [];
            const skippedList = [];
            const emailTasks = [];

            for (const user of users) {
                try {
                    const password = await bcrypt.hash("123456", process.env.OTP_SALT);
                    await user.update({
                        password,
                        status: StudentStatus.APPROVED_NOT_CHANGED
                    });

                    emailTasks.push(
                        sendMail({
                            to: user.email,
                            subject: "Tài khoản của bạn đã được mở khóa",
                            html: `
                            <h3>Xin chào ${user.name},</h3>
                            <p>Tài khoản của bạn tại hệ thống Ký túc xá đã được <strong>mở khóa</strong>.</p>
                            <p>Bạn có thể đăng nhập và tiếp tục sử dụng dịch vụ như bình thường.</p>
                            <p><strong>Mật khẩu mới:</strong> 123456</p>
                            <p>Vui lòng đổi mật khẩu sau khi đăng nhập.</p>
                            <p>Trân trọng,<br/>Ban Quản Lý Ký Túc Xá</p>
                        `,
                        })
                    );
                    approvedList.push(user.id);
                }
                catch (innerErr) {
                    skippedList.push({
                        id: user.id,
                        reason: innerErr.message || "Lỗi không xác định",
                    });
                }
            }
            await Promise.allSettled(emailTasks);
            return { approvedList, skippedList };
        } catch (err) {
            throw err;
        }
    },
};
module.exports = userServices;