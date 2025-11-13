const { Room, RoomRegistration, RoomSlot, Student, User, Admin } = require("../models");
const RoomError = require("../errors/RoomError");
const UserError = require("../errors/UserError");
const RoomRegistrationError = require("../errors/RoomRegistrationError");
const { StudentStatus } = require("../dto/request/auth.request")
const sendMail = require("../utils/mailer")
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

const roomRegistrationServices = {
    createRoomRegistration: async (createRoomRegistrationRequest, transaction) => {
        try {
            const roomSlot = await RoomSlot.findOne({
                where: { id: createRoomRegistrationRequest.roomSlotId },
                transaction
            });

            if (!roomSlot) {
                throw RoomError.RoomSlotNotFound();
            }

            if (roomSlot.isOccupied === true) {
                throw RoomError.RoomSlotIsOccupied();
            }
            await RoomRegistration.create(createRoomRegistrationRequest, { transaction })
        } catch (err) {
            throw err;
        }
    },

    getRoomRegistration: async (getRoomRegistrationRequest) => {
        try {
            const { page, limit, keyword, status } = getRoomRegistrationRequest;
            const offset = (page - 1) * limit;

            const searchCondition = keyword
                ? {
                    [Op.or]: [
                        { "$Student.User.name$": { [Op.like]: `%${keyword}%` } },
                        { "$Student.User.identification$": { [Op.like]: `%${keyword}%` } },
                        { "$RoomSlot.Room.roomNumber$": { [Op.like]: `%${keyword}%` } },
                    ],
                }
                : {};

            let statusCondition = {};
            switch (status) {
                case "Approved":
                    statusCondition = { approvedDate: { [Op.ne]: null } }; // Đã duyệt
                    break;
                case "Unapproved":
                    statusCondition = { approvedDate: null }; // Chưa duyệt
                    break;
                case "All":
                default:
                    statusCondition = {};
                    break;
            }

            const roomRegistration = await RoomRegistration.findAndCountAll({
                where: {
                    ...statusCondition,
                    ...searchCondition,
                },
                include: [
                    {
                        model: Student,
                        attributes: ["id", "mssv", "school", "userId"],
                        include: [
                            {
                                model: User,
                                attributes: ["id", "name", "identification", "dob", "gender", "address",],
                            },
                        ],
                    },
                    {
                        model: RoomSlot,
                        attributes: ["id", "slotNumber", "isOccupied"],
                        include: [
                            {
                                model: Room,
                                attributes: ["roomNumber"],
                            },
                        ],
                    },
                ],
                offset,
                limit,
                order: [["createdAt", "DESC"]],
            });

            return {
                totalItems: roomRegistration.count,
                response: roomRegistration.rows,
            };
        } catch (err) {
            throw err;
        }
    },

    approveRoomRegistration: async (approvedRoomRegistrationRequest) => {
        const transaction = await sequelize.transaction();
        try {

            const admin = await Admin.findOne({ where: { id: approvedRoomRegistrationRequest.adminId } });
            if (!admin) throw UserError.AdminNotFound();

            const roomRegistrations = await RoomRegistration.findAll({
                where: { id: approvedRoomRegistrationRequest.ids },
                include: [
                    {
                        model: Student,
                        as: "Student",
                        attributes: ["userId"],
                        include: [
                            {
                                model: User,
                                attributes: ["id", "name", "email"],
                            },
                        ],
                    },
                    {
                        model: RoomSlot,
                        include: [
                            {
                                model: Room,
                                attributes: ["roomNumber"],
                            },
                        ],
                    },
                ],
                transaction,
            });

            const approvedList = [];
            const skippedList = [];
            const emailTasks = [];

            for (const registration of roomRegistrations) {
                try {
                    const roomSlot = registration.RoomSlot;

                    if (roomSlot.isOccupied === true) {
                        skippedList.push({
                            registrationId: registration.id,
                            roomNumber: roomSlot.Room.roomNumber,
                            slotNumber: roomSlot.slotNumber,
                            reason: RoomRegistrationError.RoomSlotNotFound(),
                        });
                        continue;
                    }

                    await roomSlot.update({ isOccupied: true }, { transaction });

                    await registration.update(
                        {
                            approvedDate: new Date(),
                            adminId: admin.id,
                        },
                        { transaction }
                    );

                    const user = registration.Student.User;
                    if (user) {
                        await user.update(
                            { status: StudentStatus.APPROVED_NOT_CHANGED },
                            { transaction }
                        );

                        emailTasks.push(
                            sendMail({
                                to: user.email,
                                subject: "Đơn đăng ký vào phòng của bạn đã được duyệt!!",
                                html: `
                                        <h3>Xin chào ${user.name}</h3>
                                        <p>Đơn đăng ký vào phòng ${roomSlot.Room.roomNumber} vị trí giường số ${roomSlot.slotNumber} của bạn đã được duyệt.</p>
                                        <p>Bây giờ bạn có thể đăng nhập với tên tài khoản là số CCCD và mật khẩu mặc định là "123456".</p>
                                        <p>Vui lòng đăng nhập và đổi mật khẩu. RoomLink xin cảm ơn!</p>
                                    `,
                            })
                        );
                    }

                    approvedList.push(registration.id);

                } catch (innerErr) {
                    // 🧱 Nếu lỗi cục bộ (1 đơn) → ghi log, không rollback
                    skippedList.push({
                        registrationId: registration.id,
                        reason: innerErr.message || "Lỗi không xác định",
                    });
                }
            }

            await transaction.commit();
            await Promise.allSettled(emailTasks);
            return {
                approved: approvedList,
                skipped: skippedList,
            };

        } catch (err) {
            if (!transaction.finished) await transaction.rollback();
            throw err;
        }
    },

    rejectRoomRegistration: async (rejectRoomRegistrationRequest) => {
        const transaction = await sequelize.transaction();
        try {
            const roomRegistrations = await RoomRegistration.findAll({
                where: { id: rejectRoomRegistrationRequest.ids },
                include: [
                    {
                        model: Student,
                        as: "Student",
                        attributes: ["id", "userId"],
                        include: [{ model: User, attributes: ["id", "name", "email"] }],
                    },
                    {
                        model: RoomSlot,
                        include: [{ model: Room, attributes: ["roomNumber"] }],
                    },
                ],
                transaction,
            });

            if (roomRegistrations.length === 0) {
                throw RoomRegistrationError.IdNotFound();
            }

            const deletedList = [];
            const skippedList = [];
            const emailTasks = [];

            for (const registration of roomRegistrations) {
                try {
                    const student = registration.Student;
                    const user = student?.User;
                    const roomSlot = registration.RoomSlot;

                    await RoomRegistration.destroy({
                        where: { id: registration.id },
                        transaction,
                    });

                    if (student) {
                        await Student.destroy({
                            where: { id: student.id },
                            transaction,
                        });
                    }

                    if (user?.email) {
                        emailTasks.push(
                            sendMail({
                                to: user.email,
                                subject: "Thông báo: Đơn đăng ký ký túc xá bị từ chối",
                                html: `
                                <h3>Xin chào ${user.name}</h3>
                                <p>Rất tiếc, đơn đăng ký vào ký túc xá của bạn đã bị <strong>từ chối</strong>.</p>
                                <p>Phòng: ${roomSlot.Room.roomNumber} - Giường: ${roomSlot.slotNumber}</p>
                                <p>Nếu bạn muốn, bạn có thể đăng ký lại sau khi điều chỉnh thông tin.</p>
                                <p>RoomLink cảm ơn bạn.</p>                            
                                `,
                            })
                        );
                    }
                    if (user) {
                        await User.destroy({
                            where: { id: user.id },
                            transaction,
                        });
                    }
                    deletedList.push(registration.id);
                } catch (innerErr) {
                    skippedList.push({
                        registrationId: registration.id,
                        reason: innerErr.message || "Unknown error",
                    });
                }
            }

            await transaction.commit();
            await Promise.allSettled(emailTasks);

            return {
                deleted: deletedList,
                skipped: skippedList,
            };

        } catch (err) {
            if (!transaction.finished) await transaction.rollback();
            throw err;
        }
    },

};

module.exports = roomRegistrationServices;