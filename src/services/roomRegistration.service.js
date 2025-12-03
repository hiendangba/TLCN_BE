const {
    Room,
    RoomRegistration,
    RoomSlot,
    Student,
    User,
    Admin,
    CancellationInfo,
} = require("../models");
const RoomError = require("../errors/RoomError");
const UserError = require("../errors/UserError");
const RoomRegistrationError = require("../errors/RoomRegistrationError");
const { StudentStatus } = require("../dto/request/auth.request")
const sendMail = require("../utils/mailer")
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const paymentService = require("../services/payment.service");
require('dotenv').config();
const PaymentError = require("../errors/PaymentError");
const momoUtils = require("../utils/momo.util");
const roomRegistrationServices = {
    createRoomRegistration: async (createRoomRegistrationRequest, transaction) => {
        try {
            const roomSlot = await RoomSlot.findOne({
                where: {
                    id: createRoomRegistrationRequest.roomSlotId
                },
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
            const {
                page,
                limit,
                keyword,
                status,
                startDate,
                endDate
            } = getRoomRegistrationRequest;
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
                    statusCondition = { approvedDate: { [Op.ne]: null }, status: { [Op.in]: ["CONFIRMED", "MOVED", "MOVE_PENDING", "CANCELED", "EXTENDING"] } };
                    break;
                case "Unapproved":
                    statusCondition = { approvedDate: null, status: "BOOKED" };
                    break;
                case "All":
                default:
                    statusCondition = { status: { [Op.in]: ["BOOKED", "CONFIRMED", "MOVED", "MOVE_PENDING", "CANCELED", "EXTENDING"] } }
                    break;
            }

            const dateCondition = (startDate && endDate)
                ? {
                    approvedDate: {
                        [Op.gte]: startDate,
                        [Op.lte]: endDate
                    }
                }
                : {};


            const roomRegistration = await RoomRegistration.findAndCountAll({
                where: {
                    ...statusCondition,
                    ...searchCondition,
                    ...dateCondition
                },
                include: [{
                    model: Student,
                    attributes: ["id", "mssv", "school", "userId"],
                    include: [{
                        model: User,
                        attributes: ["id", "name", "identification", "dob", "gender", "address", "avatar", "frontIdentificationImage"],
                    },],
                },
                {
                    model: RoomSlot,
                    attributes: ["id", "slotNumber", "isOccupied"],
                    include: [{
                        model: Room,
                        attributes: ["roomNumber"],
                    },],
                },
                ],
                offset,
                limit,
                order: [
                    [sequelize.literal('CASE WHEN `RoomRegistration`.`approvedDate` IS NULL THEN 0 ELSE 1 END'), 'ASC'],
                    ["createdAt", "DESC"],
                    ["id", "ASC"]
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

            const admin = await Admin.findOne({
                where: {
                    id: approvedRoomRegistrationRequest.adminId
                }
            });
            if (!admin) throw UserError.AdminNotFound();

            const roomRegistrations = await RoomRegistration.findAll({
                where: {
                    id: approvedRoomRegistrationRequest.ids
                },
                include: [{
                    model: Student,
                    as: "Student",
                    attributes: ["userId", "id"],
                    include: [{
                        model: User,
                        attributes: ["id", "name", "email"],
                    },],
                },
                {
                    model: RoomSlot,
                    include: [{
                        model: Room,
                        attributes: ["roomNumber", "monthlyFee"],
                    },],
                },
                ],
                transaction,
            });

            const approvedList = [];
            const approvedListInfo = [];
            const skippedList = [];
            const emailTasks = [];

            for (const registration of roomRegistrations) {
                try {
                    // Reload roomSlot với lock để tránh race condition khi nhiều admin cùng duyệt
                    const roomSlot = await RoomSlot.findByPk(registration.roomSlotId, {
                        include: [{
                            model: Room,
                            attributes: ["roomNumber"]
                        }],
                        lock: transaction.LOCK.UPDATE,
                        transaction,
                    });


                    const registrationRoom = await RoomRegistration.findOne({
                        where: {
                            roomSlotId: registration.roomSlotId,
                            status: "CANCELED"
                        },
                        include: [
                            { model: CancellationInfo }
                        ],
                        transaction
                    });

                    if (registrationRoom) {
                        if (registrationRoom.CancellationInfo.checkoutDate <= new Date() && registrationRoom.CancellationInfo.refundStatus === 'APPROVED') {
                            skippedList.push({
                                registrationId: registration.id,
                                reason: "Chỗ ở này đã có người đăng ký chưa chuyển đi",
                            });
                            continue;
                        }
                    }

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
                    await roomSlot.update({
                        isOccupied: true
                    }, {
                        transaction
                    });

                    const approvedDate = new Date();
                    const endDate = new Date(approvedDate);
                    endDate.setMonth(endDate.getMonth() + Number(registration.duration));
                    console.log(endDate);
                    await registration.update(
                        {
                            approvedDate: new Date(),
                            status: "CONFIRMED",
                            adminId: admin.id,
                            endDate: getTodayDateString(endDate),
                        },
                        { transaction }
                    );

                    const user = registration.Student.User;

                    if (user) {
                        await user.update({
                            status: StudentStatus.APPROVED_NOT_CHANGED
                        }, {
                            transaction
                        });

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
                    approvedListInfo.push(registration);

                } catch (innerErr) {
                    skippedList.push({
                        registrationId: registration.id,
                        reason: innerErr.message || "Lỗi không xác định",
                    });
                }
            }

            await transaction.commit();
            await Promise.allSettled(emailTasks);

            // -----------------------------
            // 🔥 CREATE PAYMENT AFTER COMMIT 
            // -----------------------------

            const paymentList = approvedListInfo.map(item => {
                const roomFee = Number(item.RoomSlot.Room.monthlyFee);
                const duration = Number(item.duration);
                const startDate = new Date(item.approvedDate);
                const endDate = new Date(item.endDate);
                const amount = roomFee * duration;

                const content = `Thanh toán tiền phòng ${item.RoomSlot.Room.roomNumber} từ ${startDate.toLocaleDateString("vi-VN")} đến ${endDate.toLocaleDateString("vi-VN")}`;

                return {
                    amount: amount,
                    type: "ROOM",
                    content: content,
                    studentId: item.Student.id
                }
            })

            await paymentService.createPayment(paymentList);

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
        console.log("IDs trước khi query:", rejectRoomRegistrationRequest.ids);
        try {
            const roomRegistrations = await RoomRegistration.findAll({
                where: {
                    id: rejectRoomRegistrationRequest.ids
                },
                include: [{
                    model: Student,
                    as: "Student",
                    attributes: ["id", "userId"],
                    include: [{
                        model: User,
                        attributes: ["id", "name", "email"]
                    }],
                },
                {
                    model: RoomSlot,
                    include: [{
                        model: Room,
                        attributes: ["roomNumber"]
                    }],
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
                        where: {
                            id: registration.id
                        },
                        transaction,
                    });

                    if (student) {
                        await Student.destroy({
                            where: {
                                id: student.id
                            },
                            transaction,
                        });
                    }

                    if (user?.email) {
                        // Lấy lý do riêng cho đơn này, hoặc lý do chung
                        const reason = rejectRoomRegistrationRequest.reasons?.[registration.id] || "";
                        const reasonText = reason ?
                            `<p><strong>Lý do từ chối:</strong> ${reason}</p>` :
                            "";

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
                            where: {
                                id: user.id
                            },
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
                include: [{
                    model: Student,
                    attributes: ["id", "userId"],
                    include: [{
                        model: User,
                        attributes: ["name", "identification"]
                    }],
                },
                {
                    model: RoomSlot,
                    include: [{
                        model: Room,
                        attributes: ["roomNumber", "monthlyFee"]
                    }],
                },
                ],
            });

            if (!roomRegistration) {
                const existing = await RoomRegistration.findOne({
                    where: {
                        studentId: cancelRoomRegistrationRequest.roleId,
                        status: "CANCELED",
                    },
                    include: [{
                        model: CancellationInfo,
                    }]
                });

                if (existing) {
                    if (existing.CancellationInfo.refundStatus === 'PENDING') {
                        throw RoomRegistrationError.RoomRegistrationAlreadyCanceled();
                    }
                    else if (existing.CancellationInfo.refundStatus === 'APPROVED') {
                        throw RoomRegistrationError.RoomRegistrationAlreadyApproved();
                    }
                }

                throw RoomRegistrationError.RoomRegistrationNotFound();
            }
            console.log(roomRegistration.studentId);
            console.log(await paymentService.isPaid(roomRegistration.studentId));

            if (await paymentService.isPaid(roomRegistration.studentId) === false) {
                throw PaymentError.isPaid();
            }

            if (new Date(cancelRoomRegistrationRequest.checkoutDate) > roomRegistration.endDate) {
                throw RoomRegistrationError.CheckoutDateAfterEndDate();
            }
            const monthDifferences = getMonthsDifference(cancelRoomRegistrationRequest.checkoutDate, roomRegistration.endDate)
            await roomRegistration.update({
                status: "CANCELED"
            })

            const refund = monthDifferences * roomRegistration.RoomSlot.Room.monthlyFee;

            const cancellationInfo = await CancellationInfo.create({
                roomRegistrationId: roomRegistration.id,
                reason: cancelRoomRegistrationRequest.reason,
                checkoutDate: new Date(cancelRoomRegistrationRequest.checkoutDate),
                refundStatus: 'PENDING',
                amount: refund
            });

            return cancellationInfo;
        } catch (err) {
            throw err;
        }
    },

    getCancelRoom: async (getCancelRoomRequest) => {
        try {
            const {
                page,
                limit,
                keyword,
                status,
                startDate,
                endDate
            } = getCancelRoomRequest;
            const offset = (page - 1) * limit;


            const dateCondition = (startDate && endDate)
                ? {
                    endDate: {
                        [Op.gte]: startDate,
                        [Op.lte]: endDate
                    }
                }
                : {};

            const searchCondition = keyword ? {
                [Op.or]: [{
                    "$Student.User.name$": {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    "$Student.User.identification$": {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    "$Student.mssv$": {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    "$RoomSlot.Room.roomNumber$": {
                        [Op.like]: `%${keyword}%`
                    }
                },
                ],
            } : {};

            let statusCondition = {};
            switch (status) {
                case "Approved":
                    statusCondition = {
                        status: "CANCELED",
                        "$CancellationInfo.refundStatus$": "APPROVED"
                    };
                    break;
                case "Unapproved":
                    statusCondition = {
                        status: "CANCELED",
                        "$CancellationInfo.refundStatus$": "PENDING"
                    };
                    break;
                case "Reject":
                    statusCondition = {
                        status: "CANCELED",
                        "$CancellationInfo.refundStatus$": "REJECT"
                    };
                    break;
                default:
                    statusCondition = {
                        status: "CANCELED"
                    };
                    break;
            }

            const roomRegistration = await RoomRegistration.findAndCountAll({
                where: {
                    ...statusCondition,
                    ...searchCondition,
                    ...dateCondition,
                },
                include: [{
                    model: Student,
                    attributes: ["id", "mssv", "school", "userId"],
                    include: [{
                        model: User,
                        attributes: ["id", "name", "identification", "dob", "gender", "address", "avatar", "frontIdentificationImage"],
                    },],
                },
                {
                    model: RoomSlot,
                    attributes: ["id", "slotNumber", "isOccupied"],
                    include: [{
                        model: Room,
                        attributes: ["roomNumber"],
                    },],
                },
                {
                    model: CancellationInfo,
                    attributes: ["reason", "checkoutDate", "refundStatus", "amount"],
                }
                ],
                offset,
                limit,
                order: [
                    // [sequelize.literal('CASE WHEN `CancellationInfo`.`refundStatus` = "PENDING" THEN 0 ELSE 1 END'), 'ASC'],
                    [sequelize.literal(`CASE WHEN CancellationInfo.refundStatus = 'PENDING' THEN 0 ELSE 1 END`), 'ASC'],
                    ["createdAt", "DESC"],
                    ["id", "ASC"]
                ]
            });

            return {
                totalItems: roomRegistration.count,
                response: roomRegistration.rows,
            };
        } catch (err) {
            throw err;
        }
    },

    approveCancelRoom: async (approvedCancelRoomRequest) => {
        const transaction = await sequelize.transaction();
        try {

            const admin = await Admin.findOne({
                where: {
                    id: approvedCancelRoomRequest.adminId
                }
            });
            if (!admin) throw UserError.AdminNotFound();

            const roomRegistrations = await RoomRegistration.findAll({
                where: {
                    id: approvedCancelRoomRequest.ids,
                    status: "CANCELED"
                },
                include: [{
                    model: Student,
                    as: "Student",
                    attributes: ["id", "userId"],
                    include: [{
                        model: User,
                        attributes: ["id", "name", "email"],
                    },],
                },
                {
                    model: RoomSlot,
                    include: [{
                        model: Room,
                        attributes: ["roomNumber"],
                    },],
                },
                {
                    model: CancellationInfo
                }
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
                        include: [{
                            model: Room,
                            attributes: ["roomNumber"]
                        }],
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

                    await roomSlot.update({
                        isOccupied: false
                    }, {
                        transaction
                    });

                    await registration.update({
                        endDate: new Date(),
                        adminId: admin.id,
                    }, {
                        transaction
                    });

                    const user = registration.Student.User;

                    if (user) {
                        emailTasks.push(
                            sendMail({
                                to: user.email,
                                subject: "Đơn hủy phòng của bạn đã được duyệt",
                                html: `
                                    <h3>Xin chào ${user.name},</h3>
                                    <p>Đơn hủy phòng ${roomSlot.Room.roomNumber} vị trí giường số ${roomSlot.slotNumber} của bạn đã được duyệt.</p>
                                    <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
                                `,
                            })
                        );
                    }

                    await registration.CancellationInfo.update({
                        refundStatus: "APPROVED"
                    }, {
                        transaction
                    });

                    // -------------------------------------
                    // 🔥 CREATE PAYMENT AND REFUND PAYMENT
                    // ------------------------------------

                    const paymentData = {
                        content: `Hoàn tiền hủy phòng ${registration.RoomSlot.Room.roomNumber} ngày ${registration.CancellationInfo.checkoutDate}`,
                        type: "REFUND_CANCEL",
                        amount: Number(registration.CancellationInfo.amount),
                    };
                    const payment = await paymentService.createPayment(paymentData);
                    const oldPayment = await paymentService.getPaymentByStudentId(registration.Student.id, "ROOM");

                    const { bodyMoMo, rawSignature } = momoUtils.generateMomoRawSignatureRefund(payment, oldPayment);
                    const signature = momoUtils.generateMomoSignature(rawSignature);

                    const refundResponse = await momoUtils.getRefund(bodyMoMo, signature);
                    const isSuccessOrUnknown = refundResponse.data.resultCode === 0 || refundResponse.data.resultCode === 99;

                    if (!isSuccessOrUnknown || refundResponse.data.amount !== bodyMoMo.amount) {
                        throw PaymentError.InvalidAmount();
                    } else {
                        payment.status = "SUCCESS";
                        payment.transId = refundResponse.data.transId;
                        payment.studentId = registration.studentId;
                        payment.paidAt = new Date();
                        await payment.save();
                        approvedList.push(registration.id);

                    }

                } catch (innerErr) {
                    console.log(innerErr);
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

    rejectCancelRoom: async (rejectCancelRoomRequest) => {
        const { adminId, ids, reasons } = rejectCancelRoomRequest;
        const transaction = await sequelize.transaction();

        try {

            const admin = await Admin.findOne({
                where: {
                    id: adminId,
                }
            });
            if (!admin) throw UserError.AdminNotFound();

            const roomRegistrations = await RoomRegistration.findAll({
                where: {
                    id: ids,
                    status: "CANCELED"
                },
                include: [{
                    model: Student,
                    as: "Student",
                    attributes: ["id", "userId"],
                    include: [{
                        model: User,
                        attributes: ["id", "name", "email"],
                    },],
                },
                {
                    model: RoomSlot,
                    include: [{
                        model: Room,
                        attributes: ["roomNumber"],
                    },],
                },
                {
                    model: CancellationInfo,
                }
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
                        include: [{
                            model: Room,
                            attributes: ["roomNumber"]
                        }],
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

                    // Phòng này vẫn còn chổ
                    await roomSlot.update({
                        isOccupied: true
                    }, {
                        transaction
                    });

                    const user = registration.Student.User;
                    const reasonText = reasons[registration.id] || "Yêu cầu không phù hợp";

                    if (user) {
                        emailTasks.push(
                            sendMail({
                                to: user.email,
                                subject: "Đơn hủy phòng của bạn đã bị từ chối",
                                html: `
                                    <h3>Xin chào ${user.name},</h3>
                                    <p>Đơn hủy phòng ${roomSlot.Room.roomNumber} vị trí giường số ${roomSlot.slotNumber} của bạn đã bị từ chối.</p>
                                    <p>Lý do từ chối: ${reasonText}</p>
                                    <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
                                `,
                            })
                        );
                    }

                    // Cập nhật lại trạng thái 
                    await registration.update({
                        adminId: admin.id,
                        status: "CONFIRMED"
                    }, { transaction });

                    // Xóa CancellationInfo của nó luôn
                    if (registration.CancellationInfo) {
                        await registration.CancellationInfo.destroy({ transaction });
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

    requestRoomMove: async (roomMoveRequest) => {
        try {
            const roomSlot = await RoomSlot.findOne({
                where: { id: roomMoveRequest.roomSlotId }
            });

            if (!roomSlot) {
                throw RoomError.RoomSlotNotFound();
            }

            if (roomSlot.isOccupied === true) {
                throw RoomError.RoomSlotIsOccupied();
            }

            const roomRegistration = await RoomRegistration.findOne({
                where: {
                    studentId: roomMoveRequest.roleId,
                    status: "CONFIRMED"
                },
            });

            if (!roomRegistration) {
                const existing = await RoomRegistration.findOne({
                    where: {
                        studentId: roomMoveRequest.roleId,
                        status: "MOVE_PENDING",
                    },
                });
                if (existing) {
                    throw RoomRegistrationError.RoomMoveAlreadyRequested();
                }

                throw RoomRegistrationError.RoomRegistrationNotFound();
            }

            if (await paymentService.isPaid(roomRegistration.studentId) === false) {
                throw PaymentError.isPaid();
            }

            if (roomRegistration.status !== "CONFIRMED") {
                throw RoomRegistrationError.InvalidMoveRequest();
            }

            await roomRegistration.update({
                status: "MOVE_PENDING"
            });

            const newRoomRegistration = await RoomRegistration.create({
                studentId: roomMoveRequest.roleId,
                roomSlotId: roomMoveRequest.roomSlotId,
                status: "PENDING",
                registerDate: new Date(),
                previousRegistrationId: roomRegistration.id,
                duration: roomMoveRequest.duration
            });

            return newRoomRegistration;

        } catch (err) {
            throw err;
        }
    },

    getRoomMove: async (getRoomMoveRequest) => {
        try {
            const { page = 1, limit = 10, keyword, status, startDate, endDate } = getRoomMoveRequest;
            const offset = (page - 1) * limit;

            const dateCondition = (startDate && endDate)
                ? {
                    endDate: {
                        [Op.gte]: startDate,
                        [Op.lte]: endDate
                    },
                    status: "MOVED",
                }
                : {};

            // ---------- SEARCH CONDITION ----------
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

            // ---------- STATUS FILTER ----------
            let statusCondition = {};
            switch (status) {
                case "Approved":
                    statusCondition = { status: "MOVED" };
                    break;
                case "Unapproved":
                    statusCondition = { status: "MOVE_PENDING" };
                    break;
                default:
                    statusCondition = { status: { [Op.in]: ["MOVED", "MOVE_PENDING"] } };
                    break;
            }

            const roomRegistration = await RoomRegistration.findAndCountAll({
                where: {
                    ...(startDate && endDate ? {} : statusCondition),
                    ...searchCondition,
                    ...dateCondition
                },
                include: [
                    {
                        model: Student,
                        attributes: ["id", "mssv", "school", "userId"],
                        include: [
                            {
                                model: User,
                                attributes: [
                                    "id", "name", "identification", "dob", "gender",
                                    "address", "avatar", "frontIdentificationImage"
                                ],
                            },
                        ],
                    },
                    {
                        model: RoomSlot,
                        attributes: ["id", "slotNumber", "isOccupied"],
                        include: [{ model: Room, attributes: ["roomNumber", "monthlyFee"] }],
                    }
                ],
                offset,
                limit,
                order: [
                    [sequelize.literal('CASE WHEN `RoomRegistration`.`status` = \'MOVE_PENDING\' THEN 0 ELSE 1 END'), "ASC"],
                    ["createdAt", "DESC"],
                    ["id", "ASC"]
                ]
            });

            if (!roomRegistration || !roomRegistration.rows || roomRegistration.rows.length === 0) {
                return {
                    totalItems: 0,
                    response: []
                };
            }

            const originalIds = roomRegistration.rows.map(r => r.id);
            const newRoomRegistration = await RoomRegistration.findAll({
                where: {
                    previousRegistrationId: { [Op.in]: originalIds },
                    status: { [Op.in]: ["PENDING", "CONFIRMED", "MOVED", "MOVE_PENDING", "EXTENDED", "PENDING_EXTENDED", "CANCELED"] },
                },
                include: [
                    {
                        model: RoomSlot,
                        attributes: ["id", "slotNumber", "isOccupied"],
                        include: [{ model: Room, attributes: ["roomNumber", "monthlyFee"] }],
                    },
                ],
                order: [["createdAt", "DESC"], ["id", "ASC"]],
            });
            // ---------- BUILD MAP BY ORIGINAL ID ----------
            const registrationMap = {};
            roomRegistration.rows.forEach(reg => {
                const plain = reg.toJSON ? reg.toJSON() : JSON.parse(JSON.stringify(reg));
                registrationMap[plain.id] = { original: plain, new: null };
            });

            // ---------- MAP NEW REGISTRATIONS BY previousRegistrationId ----------
            newRoomRegistration.forEach(reg => {
                const plain = reg.toJSON ? reg.toJSON() : JSON.parse(JSON.stringify(reg));
                if (!plain.RoomSlot) plain.RoomSlot = {};
                if (plain.RoomSlot && !plain.RoomSlot.Room) plain.RoomSlot.Room = {};

                const prevId = plain.previousRegistrationId;
                if (prevId == null) return;

                const exist = registrationMap[prevId];
                if (!exist) return;

                // Chỉ gán new 1 lần (lấy bản mới nhất do order DESC)
                if (!exist.new) {
                    exist.new = plain;
                }
            });

            // ---------- BUILD RESPONSE ----------
            const combinedRegistrations = Object.values(registrationMap)
                .filter(item => item.new) // chỉ lấy những bản có newRegistration
                .map(item => ({
                    originalRegistration: item.original,
                    newRegistration: item.new,
                }));

            return {
                totalItems: roomRegistration.count,
                response: combinedRegistrations,
            };
        } catch (err) {
            throw err;
        }
    },

    approveRoomMove: async (approvedMoveRoomRequest) => {
        const transaction = await sequelize.transaction();
        try {

            const admin = await Admin.findOne({ where: { id: approvedMoveRoomRequest.adminId } });
            if (!admin) throw UserError.AdminNotFound();

            const roomRegistrations = await RoomRegistration.findAll({
                where: {
                    id: approvedMoveRoomRequest.ids,
                    status: "MOVE_PENDING"
                },
                include: [
                    {
                        model: Student,
                        as: "Student",
                        attributes: ["id"],
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
                                attributes: ["roomNumber", "monthlyFee"],
                            },
                        ],
                    }
                ],
                transaction,
            });

            const approvedList = [];
            const skippedList = [];
            const emailTasks = [];

            if (roomRegistrations.length === 0) {
                throw RoomRegistrationError.RoomMoveNotFound();
            }

            for (const registration of roomRegistrations) {
                try {

                    let monthlyFeeDifference;

                    const roomSlot = await RoomSlot.findByPk(registration.roomSlotId, {
                        include: [{ model: Room, attributes: ["roomNumber"] }],
                        lock: transaction.LOCK.UPDATE,
                        transaction,
                    });

                    const approveDate = new Date();
                    const fourteenDaysBeforeEnd = new Date(registration.endDate);
                    fourteenDaysBeforeEnd.setDate(fourteenDaysBeforeEnd.getDate() - 14);

                    if (approveDate > fourteenDaysBeforeEnd) {
                        skippedList.push({
                            registrationId: registration.id,
                            reason: "Hợp đồng không còn hiệu lực (dưới 14 ngày)",
                        });
                        continue;
                    }

                    if (!roomSlot) {
                        skippedList.push({
                            registrationId: registration.id,
                            reason: "Không tìm thấy slot phòng",
                        });
                        continue;
                    }

                    await roomSlot.update({ isOccupied: false }, { transaction });

                    const fourteenDaysLater = new Date();
                    fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
                    const dayStr = getTodayDateString(fourteenDaysLater);
                    const endDateRecord = new Date(registration.endDate);
                    const endDate = new Date(registration.endDate);
                    await registration.update(
                        {
                            status: "MOVED",
                            adminId: admin.id,
                            endDate: dayStr,
                        },
                        { transaction }
                    );

                    const newRegistration = await RoomRegistration.findOne({
                        where: {
                            studentId: registration.studentId,
                            status: "PENDING"
                        },
                        include: [
                            {
                                model: RoomSlot,
                                include: [{ model: Room, attributes: ["roomNumber", "monthlyFee"] }],
                            }
                        ],
                        transaction,
                    });

                    if (!newRegistration) {
                        skippedList.push({
                            registrationId: registration.id
                        })
                        continue;

                    } else {

                        endDateRecord.setMonth(endDateRecord.getMonth() + Number(newRegistration.duration));
                        await newRegistration.update(
                            {
                                status: "CONFIRMED",
                                approvedDate: dayStr,
                                endDate: endDateRecord,
                                adminId: admin.id,
                            },
                            { transaction }
                        );

                        await RoomSlot.update(
                            { isOccupied: true },
                            {
                                where: { id: newRegistration.roomSlotId },
                                transaction,
                                lock: transaction.LOCK.UPDATE,
                            }
                        );

                        const monthDifference = getMonthsDifference(dayStr, endDate);
                        monthlyFeeDifference = (newRegistration.RoomSlot.Room.monthlyFee - registration.RoomSlot.Room.monthlyFee) * monthDifference + Number(newRegistration.duration) * newRegistration.RoomSlot.Room.monthlyFee;
                        const dayFormatted = formatDateVN(dayStr);
                        const user = registration.Student.User;

                        if (user) {
                            let feeMessage = '';
                            if (monthlyFeeDifference > 0) {
                                feeMessage = `<p>Vui lòng thanh toán thêm <b>${formatCurrencyVND(monthlyFeeDifference)}</b> do chênh lệch phí phòng.</p>`;
                            } else if (monthlyFeeDifference < 0) {
                                feeMessage = `<p>Bạn sẽ được hoàn <b>${formatCurrencyVND(Math.abs(monthlyFeeDifference))}</b> do chênh lệch phí phòng.</p>`;
                            }
                            else {
                                feeMessage = `<p>Phí phòng của bạn không thay đổi do chênh lệch phí phòng.</p>`;
                            }
                            emailTasks.push(
                                sendMail({
                                    to: user.email,
                                    subject: "Đơn chuyển phòng của bạn đã được duyệt",
                                    html: `
                                        <h3>Xin chào ${user.name},</h3>
                                        <p>Đơn chuyển phòng của bạn đã được <b>duyệt thành công</b>.</p>
                                        <p><b>Chuyển từ phòng:</b> ${roomSlot.Room.roomNumber}, vị trí giường số ${roomSlot.slotNumber}</p>
                                        <p><b>Đến phòng:</b> ${newRegistration.RoomSlot.Room.roomNumber}, vị trí giường số ${newRegistration.RoomSlot.slotNumber}</p>
                                        <p>Vui lòng sắp xếp và hoàn thành việc chuyển sang phòng mới trong vòng <b>14 ngày</b> kể từ ngày ${dayFormatted}</p>
                                        ${feeMessage}
                                        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
                                    `,
                                })
                            );
                        }

                        if (monthlyFeeDifference > 0) {
                            const paymentData = {
                                amount: Number(monthlyFeeDifference),
                                type: "ROOM",
                                content: `Thanh toán chi phí phát sinh do chuyển đến phòng ${newRegistration.RoomSlot.Room.roomNumber}`,
                                studentId: registration.Student.id
                            }
                            await paymentService.createPayment(paymentData);
                        }
                        //Khi dư cần hoàn tiền
                        else if (monthlyFeeDifference < 0) {
                            // Tạo payment hoàn tiền nếu như dư
                            const paymentData = {
                                amount: Number(Math.abs(monthlyFeeDifference)),
                                type: "REFUND_MOVE",
                                content: `Hoàn tiền do chuyển đến phòng ${newRegistration.RoomSlot.Room.roomNumber}`
                            }
                            const payment = await paymentService.createPayment(paymentData);
                            const oldPayment = await paymentService.getPaymentByStudentId(registration.Student.id, "ROOM");
                            const { bodyMoMo, rawSignature } = momoUtils.generateMomoRawSignatureRefund(payment, oldPayment);
                            const signature = momoUtils.generateMomoSignature(rawSignature);

                            const refundResponse = await momoUtils.getRefund(bodyMoMo, signature);
                            const isSuccessOrUnknown = refundResponse.data.resultCode === 0 || refundResponse.data.resultCode === 99;

                            if (!isSuccessOrUnknown || refundResponse.data.amount !== bodyMoMo.amount) {
                                throw PaymentError.InvalidAmount();
                            } else {
                                payment.status = "SUCCESS";
                                payment.transId = refundResponse.data.transId;
                                payment.studentId = registration.studentId;;
                                payment.paidAt = new Date();
                                await payment.save();
                            }
                        }
                        approvedList.push(registration.id);
                    }
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

    rejectRoomMove: async (rejectRoomMoveRequest) => {
        const { adminId, ids, reasons } = rejectRoomMoveRequest;
        const transaction = await sequelize.transaction();

        try {
            const admin = await Admin.findOne({
                where: {
                    id: adminId,
                },
                transaction
            });

            if (!admin) throw UserError.AdminNotFound();

            const roomRegistrations = await RoomRegistration.findAll({
                where: {
                    id: ids,
                    status: "MOVE_PENDING"
                },
                include: [{
                    model: Student, // lay student de gui email
                    as: "Student",
                    attributes: ["id", "userId"],
                    include: [{
                        model: User,
                        attributes: ["id", "name", "email"],
                    },],
                },
                {
                    model: RoomSlot, // lay roomSlot de lam content cho email
                    include: [{
                        model: Room,
                        attributes: ["roomNumber"],
                    },],
                },
                ],
                transaction,
            });

            if (roomRegistrations.length === 0) {
                throw RoomRegistrationError.RoomMoveNotFound();
            }

            const rejectedList = [];
            const skippedList = [];
            const emailTasks = [];

            for (const registration of roomRegistrations) {
                try {
                    // lấy ra đơn chuyển phòng tạo mới
                    const newRegistration = await RoomRegistration.findOne({
                        where: {
                            previousRegistrationId: registration.id,
                            status: "PENDING"
                        },
                        include: [
                            {
                                model: RoomSlot,
                                include: [{
                                    model: Room,
                                    attributes: ["roomNumber"]
                                }]
                            }
                        ],
                        transaction
                    });

                    if (!newRegistration) {
                        throw RoomRegistrationError.RoomMoveNotFound();
                    }

                    // cập nhật lại trạng thái cho cái gốc là confirmed
                    await registration.update({
                        adminId: adminId,
                        status: "CONFIRMED"
                    }, { transaction });

                    const newRoom = newRegistration.RoomSlot.Room.roomNumber;
                    const newRoomSlot = newRegistration.RoomSlot.slotNumber;

                    // Xóa luôn đơn của cái con
                    await newRegistration.destroy({ transaction });

                    // soạn mail gửi cho sinh viên
                    const user = registration.Student.User;
                    const reasonText = reasons[registration.id] || "Yêu cầu không phù hợp";

                    if (user) {
                        emailTasks.push(
                            sendMail({
                                to: user.email,
                                subject: "Yêu cầu chuyển phòng của bạn đã bị từ chối",
                                html: `
                                    <h3>Xin chào ${user.name},</h3>
                                    <p>Yêu cầu chuyển từ phòng <strong>${registration.RoomSlot.Room.roomNumber}</strong> (giường số <strong>${registration.RoomSlot.slotNumber}</strong>) sang phòng <strong>${newRoom}</strong> (giường số <strong>${newRoomSlot}</strong>) đã bị từ chối.</p>
                                    <p><strong>Lý do:</strong> ${reasonText}</p>
                                    <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
                                `,
                            })
                        );
                    }

                    rejectedList.push(registration.id);

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
                rejected: rejectedList,
                skipped: skippedList,
            };
        }
        catch (err) {
            if (!transaction.finished) await transaction.rollback();
            throw err;
        }
    },

    requestRoomExtend: async (roomExtendRequest) => {
        try {

            const roomRegistration = await RoomRegistration.findOne({
                where: {
                    studentId: roomExtendRequest.roleId,
                    status: "CONFIRMED"
                },
            });

            if (!roomRegistration) {
                const existing = await RoomRegistration.findOne({
                    where: {
                        studentId: roomExtendRequest.roleId,
                        status: "EXTENDING",
                    },
                });

                if (existing) {
                    throw RoomRegistrationError.RoomExtendAlreadyRequested();
                }

                throw RoomRegistrationError.RoomRegistrationNotFound();
            }

            if (getTodayDateString(new Date()) > roomRegistration.endDate) {
                throw RoomRegistrationError.ExtendTooLate();
            }

            if (roomRegistration.status !== "CONFIRMED") {
                throw RoomRegistrationError.InvalidExtendRequest();
            }

            if (await paymentService.isPaid(roomRegistration.studentId) === false) {
                throw PaymentError.isPaid();
            }
            await roomRegistration.update({
                status: "EXTENDING"
            })

            const newEndDate = new Date(roomRegistration.endDate);
            newEndDate.setMonth(newEndDate.getMonth() + Number(roomExtendRequest.duration));
            const newEndDateStr = getTodayDateString(newEndDate);

            await RoomRegistration.create({
                studentId: roomExtendRequest.roleId,
                roomSlotId: roomRegistration.roomSlotId,
                status: "PENDING_EXTENDED",
                registerDate: new Date(),
                approvedDate: roomRegistration.endDate,
                endDate: newEndDateStr,
                duration: roomExtendRequest.duration,
            });
            return roomRegistration;

        } catch (err) {
            throw err;
        }
    },

    getExtendRoom: async (getRoomExtendRequest) => {
        try {
            const { page, limit, keyword, status, startDate, endDate } = getRoomExtendRequest;
            const offset = (page - 1) * limit;
            const dateCondition = (startDate && endDate)
                ? {
                    endDate: {
                        [Op.gte]: startDate,
                        [Op.lte]: endDate
                    },
                    status: "EXTENDED"
                }
                : {};

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
                    statusCondition = { status: "EXTENDED" };
                    break;
                case "Unapproved":
                    statusCondition = { status: "EXTENDING" };
                    break;
                default:
                    statusCondition = {
                        status: { [Op.in]: ["EXTENDING", "EXTENDED"] }
                    };
                    break;
            }

            const roomRegistration = await RoomRegistration.findAndCountAll({
                where: {
                    ...dateCondition,
                    ...(startDate && endDate ? {} : statusCondition),
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
                                attributes: ["roomNumber", "monthlyFee"],
                            },
                        ],
                    }
                ],
                offset,
                limit,
                order: [
                    // [sequelize.literal('CASE WHEN `RoomRegistration`.`status` = "EXTENDING" THEN 0 ELSE 1 END'), 'ASC'],
                    [sequelize.literal("CASE WHEN `RoomRegistration`.`status` = 'EXTENDING' THEN 0 ELSE 1 END"), 'ASC'],
                    ["createdAt", "DESC"],
                    ["id", "ASC"]
                ]
            });
            const newRoomRegistration = await RoomRegistration.findAll({
                where: {
                    status: { [Op.in]: ["PENDING_EXTENDED", "CONFIRMED"] },
                    studentId: { [Op.in]: roomRegistration.rows.map(r => r.studentId) }
                }
            });
            const registrationMap = {};
            roomRegistration.rows.forEach(reg => {
                registrationMap[reg.studentId] = {
                    original: reg,
                    new: null
                };
            });

            newRoomRegistration.forEach(reg => {
                if (registrationMap[reg.studentId]) {
                    registrationMap[reg.studentId].new = reg;
                }
            });
            const combinedRegistrations = Object.values(registrationMap).map(item => ({
                originalRegistration: item.original,
                newRegistration: item.new,
            }));

            return {
                totalItems: roomRegistration.count,
                response: combinedRegistrations,
            };
        } catch (err) {
            throw err;
        }
    },

    approveRoomExtend: async (approvedExtendRoomRequest) => {
        const transaction = await sequelize.transaction();
        try {

            const admin = await Admin.findOne({ where: { id: approvedExtendRoomRequest.adminId } });
            if (!admin) throw UserError.AdminNotFound();

            const roomRegistrations = await RoomRegistration.findAll({
                where: {
                    id: approvedExtendRoomRequest.ids,
                    status: "EXTENDING"
                },
                include: [
                    {
                        model: Student,
                        as: "Student",
                        attributes: ["id"],
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
                                attributes: ["roomNumber", "monthlyFee"],
                            },
                        ],
                    }
                ],
                transaction,
            });

            const approvedList = [];
            const skippedList = [];
            const emailTasks = [];

            if (roomRegistrations.length === 0) {
                throw RoomRegistrationError.RoomExtendNotFound();
            }

            for (const registration of roomRegistrations) {
                try {
                    if (new Date() > new Date(registration.endDate)) {
                        skippedList.push({
                            registrationId: registration.id,
                            reason: "Thời gian hiện tại lớn hơn thời gian kết thúc hợp đồng",
                        });
                        continue;
                    }
                    if (registration.status !== "EXTENDING") {
                        skippedList.push({
                            registrationId: registration.id,
                            reason: "Đơn gia hạn không ở trạng thái chờ duyệt",
                        });
                        continue;
                    }

                    const newRegistration = await RoomRegistration.findOne({
                        where: {
                            studentId: registration.studentId,
                            status: "PENDING_EXTENDED"
                        },
                        transaction,
                    });

                    if (!newRegistration) {
                        skippedList.push({
                            registrationId: registration.id
                        })
                        continue;

                    } else {

                        await newRegistration.update(
                            {
                                status: "CONFIRMED",
                                adminId: admin.id,
                            },
                            { transaction }
                        );

                        await registration.update(
                            {
                                status: "EXTENDED",
                                adminId: admin.id,
                                endDate: new Date(),
                            },
                            { transaction }
                        );

                        let monthlyFeeDifference = registration.RoomSlot.Room.monthlyFee * Number(newRegistration.duration);

                        const user = registration.Student.User;

                        if (user) {

                            const feeMessage = `<p>Vui lòng thanh toán thêm <b>${formatCurrencyVND(monthlyFeeDifference)}</b> để hoàn tất gia hạn.</p>`;

                            emailTasks.push(
                                sendMail({
                                    to: user.email,
                                    subject: "Yêu cầu gia hạn phòng đã được duyệt",
                                    html: `
                                        <h3>Xin chào ${user.name},</h3>

                                        <p>Yêu cầu <b>gia hạn hợp đồng phòng</b> của bạn đã được <b>duyệt thành công</b>.</p>
                                        <p><b>Phòng:</b> ${registration.RoomSlot.Room.roomNumber}, vị trí giường số ${registration.RoomSlot.slotNumber}</p>
                                        <p><b>Ngày hết hạn cũ:</b> ${formatDateVN(registration.endDate)}</p>
                                        <p><b>Ngày hết hạn mới:</b> ${formatDateVN(newRegistration.endDate)}</p>
                                        <p><b>Số tháng gia hạn:</b> ${newRegistration.duration} tháng</p>
                                        ${feeMessage}
                                        <p>Cảm ơn bạn đã tiếp tục đồng hành cùng chúng tôi!</p>
                                    `,
                                })
                            );
                        }

                        if (monthlyFeeDifference > 0) {
                            const paymentData = {
                                content: `Thanh toán chi phí gia hạn phòng ${registration.RoomSlot.Room.roomNumber} từ ${formatDateVN(newRegistration.approvedDate)} đến ${formatDateVN(newRegistration.endDate)}`,
                                type: "ROOM",
                                amount: Number(monthlyFeeDifference),
                                studentId: registration.Student.id
                            }

                            await paymentService.createPayment(paymentData);
                        }

                        approvedList.push(registration.id);
                    }
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

    rejectRoomExtend: async (rejectExtendRoomRequest) => {
        const { ids, adminId, reasons } = rejectExtendRoomRequest;
        const transaction = await sequelize.transaction();

        try {

            const admin = await Admin.findOne({
                where: {
                    id: adminId,
                },
                transaction
            })

            if (!admin) {
                throw UserError.AdminNotFound();
            }

            const roomRegistrations = await RoomRegistration.findAll({
                where: {
                    id: ids,
                    status: "EXTENDING"
                },
                include: [{
                    model: Student, // lay student de gui email
                    as: "Student",
                    attributes: ["id", "userId"],
                    include: [{
                        model: User,
                        attributes: ["id", "name", "email"],
                    },],
                },
                {
                    model: RoomSlot, // lay roomSlot de lam content cho email
                    include: [{
                        model: Room,
                        attributes: ["roomNumber"],
                    },],
                },
                ],
                transaction,
            })

            if (roomRegistrations.length === 0) {
                throw RoomRegistrationError.RoomExtendNotFound();
            }

            const rejectedList = [];
            const skippedList = [];
            const emailTasks = [];

            for (const registration of roomRegistrations) {
                try {
                    // lấy ra đơn chuyển phòng tạo mới
                    const newRegistration = await RoomRegistration.findOne({
                        where: {
                            studentId: registration.studentId,
                            status: "PENDING_EXTENDED"
                        },
                        include: [
                            {
                                model: RoomSlot,
                                include: [{
                                    model: Room,
                                    attributes: ["roomNumber"]
                                }]
                            }
                        ],
                        transaction
                    });

                    if (!newRegistration) {
                        throw new RoomRegistrationError.RoomExtendNotFound();
                    }

                    // cập nhật lại trạng thái cho cái gốc là confirmed
                    await registration.update({
                        adminId: adminId,
                        status: "CONFIRMED"
                    }, { transaction });

                    // Xóa cái đơn con được tạo
                    await newRegistration.destroy({ transaction });

                    // soạn mail gửi cho sinh viên
                    const user = registration.Student.User;
                    const reasonText = reasons[registration.id] || "Yêu cầu không phù hợp";

                    if (user) {
                        emailTasks.push(
                            sendMail({
                                to: user.email,
                                subject: "Yêu cầu gia hạn phòng của bạn đã bị từ chối",
                                html: `
                                    <h3>Xin chào ${user.name},</h3>
                                    <p>Yêu cầu gia hạn phòng <strong>${registration.RoomSlot.Room.roomNumber}</strong> (giường số <strong>${registration.RoomSlot.slotNumber}</strong>) của bạn đã bị từ chối.</p>
                                    <p><strong>Lý do:</strong> ${reasonText}</p>
                                    <p>Phòng của bạn sẽ hết hạn vào ngày: <strong> ${formatDateVN(registration.endDate)} </strong></p>
                                    <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
                                `,
                            })
                        );
                    }

                    rejectedList.push(registration.id);
                }

                catch (innerErr) {
                    skippedList.push({
                        registrationId: registration.id,
                        reason: innerErr.message || "Lỗi không xác định",
                    });
                }
            }

            await transaction.commit();
            await Promise.allSettled(emailTasks);

            return {
                rejectedList,
                skippedList
            };
        }
        catch (err) {
            if (!transaction.finished) {
                await transaction.rollback();
            }
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

function getTodayDateString(today) {
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Tháng 0 → +1
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function formatDateVN(dateStr) {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function formatCurrencyVND(amount) {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

module.exports = roomRegistrationServices;