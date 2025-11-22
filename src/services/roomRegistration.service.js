const { Room, RoomRegistration, RoomSlot, Student, User, Admin, CancellationInfo } = require("../models");
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
                        { "$Student.mssv$": { [Op.like]: `%${keyword}%` } },
                        { "$RoomSlot.Room.roomNumber$": { [Op.like]: `%${keyword}%` } },
                    ],
                }
                : {};

            let statusCondition = {};
            switch (status) {
                case "Approved":
                    statusCondition = { approvedDate: { [Op.ne]: null }, status: { [Op.in]: ["CONFIRMED", "MOVED", "CANCELED"] } }; // Đã duyệt
                    break;
                case "Unapproved":
                    statusCondition = { approvedDate: null, status: "BOOKED" }; // Chưa duyệt
                    break;
                case "All":
                default:
                    statusCondition = {
                    };
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
                                attributes: ["id", "name", "identification", "dob", "gender", "address", "avatar", "frontIdentificationImage"],
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
                order: [
                    // Ưu tiên đơn chờ duyệt (approvedDate = NULL) lên trên
                    [sequelize.literal('CASE WHEN "approvedDate" IS NULL THEN 0 ELSE 1 END'), 'ASC'],
                    ["createdAt", "DESC"]
                ],
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
                    // Reload roomSlot với lock để tránh race condition khi nhiều admin cùng duyệt
                    const roomSlot = await RoomSlot.findByPk(registration.roomSlotId, {
                        include: [{ model: Room, attributes: ["roomNumber"] }],
                        lock: transaction.LOCK.UPDATE,
                        transaction,
                    });

                    if (!roomSlot) {
                        skippedList.push({
                            registrationId: registration.id,
                            reason: "Không tìm thấy slot phòng",
                        });
                        continue;
                    }

                    // Kiểm tra lại lần nữa xem slot đã có người ở chưa
                    if (roomSlot.isOccupied === true) {
                        skippedList.push({
                            registrationId: registration.id,
                            roomNumber: roomSlot.Room.roomNumber,
                            slotNumber: roomSlot.slotNumber,
                            reason: "Chỗ ở này đã có người đăng ký",
                        });
                        continue;
                    }

                    // Đánh dấu slot đã được sử dụng
                    await roomSlot.update({ isOccupied: true }, { transaction });

                    await registration.update(
                        {
                            approvedDate: new Date(),
                            status: "CONFIRMED",
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
                        // Lấy lý do riêng cho đơn này, hoặc lý do chung
                        const reason = rejectRoomRegistrationRequest.reasons?.[registration.id] || "";
                        const reasonText = reason
                            ? `<p><strong>Lý do từ chối:</strong> ${reason}</p>`
                            : "";

                        emailTasks.push(
                            sendMail({
                                to: user.email,
                                subject: "Thông báo: Đơn đăng ký ký túc xá bị từ chối",
                                html: `
                                <h3>Xin chào ${user.name}</h3>
                                <p>Rất tiếc, đơn đăng ký vào ký túc xá của bạn đã bị <strong>từ chối</strong>.</p>
                                <p>Phòng: ${roomSlot.Room.roomNumber} - Giường: ${roomSlot.slotNumber}</p>
                                ${reasonText}
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

    cancelRoomRegistration: async (cancelRoomRegistrationRequest) => {
        try {
            const roomRegistration = await RoomRegistration.findOne({
                where: {
                    studentId: cancelRoomRegistrationRequest.roleId,
                    status: "CONFIRMED"
                },
                include: [
                    {
                        model: Student,
                        attributes: ["userId"],
                        include: [{ model: User, attributes: ["name", "identification"] }],
                    },
                    {
                        model: RoomSlot,
                        include: [{ model: Room, attributes: ["roomNumber", "monthlyFee"] }],
                    },
                ],
            });

            if (!roomRegistration) {
                throw RoomRegistrationError.RoomRegistrationNotFound();
            }

            if (new Date(cancelRoomRegistrationRequest.checkoutDate) > roomRegistration.endDate) {
                throw RoomRegistrationError.CheckoutDateAfterEndDate();
            }
            const monthDifferences = getMonthsDifference(cancelRoomRegistrationRequest.checkoutDate, roomRegistration.endDate)
            await roomRegistration.update({
                status: "CANCELED"
            })

            const cancellationInfo = await CancellationInfo.create({
                roomRegistrationId: roomRegistration.id,
                bankBin: cancelRoomRegistrationRequest.bankBin,
                bankAccountNumber: cancelRoomRegistrationRequest.bankAccountNumber,
                bankName: cancelRoomRegistrationRequest.bankName,
                reason: cancelRoomRegistrationRequest.reason,
                checkoutDate: new Date(cancelRoomRegistrationRequest.checkoutDate),
                refundStatus: 'PENDING',
                amount: monthDifferences * roomRegistration.RoomSlot.Room.monthlyFee,
            });
            return cancellationInfo;
        } catch (err) {
            throw err;
        }
    },

    getCancelRoom: async (getCancelRoomRequest) => {
        try {
            return true
        } catch (err) {
            throw err;
        }
    },

    approveRoomMove: async (roleId) => {
        try {
            return true
        } catch (err) {
            throw err;
        }
    },
};


function getMonthsDifference(checkoutDate, endDate) {
    const checkout = new Date(checkoutDate);
    const end = new Date(endDate);
    const yearsDiff = end.getFullYear() - checkout.getFullYear();
    const monthsDiff = end.getMonth() - checkout.getMonth();

    let totalMonths = yearsDiff * 12 + monthsDiff;

    if (end.getDate() < checkout.getDate()) {
        totalMonths -= 1;
    }

    return totalMonths;
}

module.exports = roomRegistrationServices;