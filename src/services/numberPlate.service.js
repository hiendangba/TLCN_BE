const { NumberPlate, Student, User, Admin } = require("../models");
const cloudinary = require("../config/cloudinary");
const NumberPlateError = require("../errors/NumberPlateError");
const UserError = require("../errors/UserError");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const sendMail = require("../utils/mailer");

const numberPlateServices = {
    createNumberPlate: async (createNumberPlateRequest, filename) => {
        try {
            const existsNumber = await NumberPlate.findOne({
                where: { number: createNumberPlateRequest.number }
            })
            if (existsNumber) {
                await cloudinary.uploader.destroy(filename);
                throw NumberPlateError.NameExists();
            }
            const numberPlate = NumberPlate.create(createNumberPlateRequest);
            return numberPlate;
        } catch (err) {
            throw err;
        }
    },

    getNumberPlate: async (getNumberPlateRequest) => {
        try {
            const { page, limit, keyword, status } = getNumberPlateRequest;
            const offset = (page - 1) * limit;
            const searchCondition = keyword
                ? {
                    [Op.or]: [
                        { "$Student.User.name$": { [Op.like]: `%${keyword}%` } },
                        { "$Student.User.identification$": { [Op.like]: `%${keyword}%` } },
                        { "$Student.mssv$": { [Op.like]: `%${keyword}%` } }, // Thêm MSSV vào tìm kiếm
                        { "$number$": { [Op.like]: `%${keyword}%` } },
                    ],
                }
                : {};

            let statusCondition = {};
            if (status) {
                statusCondition = { status };
            }

            const numberPlate = await NumberPlate.findAndCountAll({
                where: {
                    ...searchCondition,
                    ...statusCondition,
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
                    }
                ],
                offset,
                limit,
                order: [
                    // Ưu tiên đơn chờ duyệt (pending) lên trên
                    [sequelize.literal('CASE WHEN `NumberPlate`.`status` = \'pending\' THEN 0 WHEN `NumberPlate`.`status` = \'rejected\' THEN 1 ELSE 2 END'), 'ASC'],
                    ["createdAt", "DESC"]
                ],
            });

            return { totalItems: numberPlate.count, response: numberPlate.rows };
        } catch (err) {
            throw err;
        }
    },

    approvedNumberPlate: async (approvedNumberPlateRequest) => {
        const transaction = await sequelize.transaction();
        try {
            const admin = await Admin.findOne({ where: { id: approvedNumberPlateRequest.adminId } });
            if (!admin) throw UserError.AdminNotFound();

            const numberPlates = await NumberPlate.findAll({
                where: { id: approvedNumberPlateRequest.ids },
                include: [
                    {
                        model: Student,
                        attributes: ["userId"],
                        include: [
                            {
                                model: User,
                                attributes: ["id", "name", "email"],
                            },
                        ],
                    },
                ],
                transaction,
            });

            const approvedList = [];
            const skippedList = [];
            const emailTasks = [];

            for (const numberPlate of numberPlates) {
                try {
                    // Reload numberPlate với lock để tránh race condition khi nhiều admin cùng duyệt
                    const reloadedNumberPlate = await NumberPlate.findByPk(numberPlate.id, {
                        lock: transaction.LOCK.UPDATE, // Lock row để tránh concurrent update
                        transaction,
                    });

                    if (!reloadedNumberPlate) {
                        skippedList.push({
                            numberPlateId: numberPlate.id,
                            reason: "Không tìm thấy đơn đăng ký",
                        });
                        continue;
                    }

                    // Kiểm tra lại lần nữa xem số biển số này đã được duyệt cho đơn khác chưa
                    const existingApproved = await NumberPlate.findOne({
                        where: {
                            number: reloadedNumberPlate.number,
                            status: "approved",
                            id: { [Op.ne]: reloadedNumberPlate.id }, // Không tính chính đơn này
                        },
                        transaction,
                    });

                    if (existingApproved) {
                        skippedList.push({
                            numberPlateId: numberPlate.id,
                            number: reloadedNumberPlate.number,
                            reason: "Số biển số này đã được duyệt cho đơn khác",
                        });
                        continue;
                    }

                    // Kiểm tra xem đơn này đã được duyệt chưa
                    if (reloadedNumberPlate.status === "approved") {
                        skippedList.push({
                            numberPlateId: numberPlate.id,
                            number: reloadedNumberPlate.number,
                            reason: "Đơn này đã được duyệt rồi",
                        });
                        continue;
                    }

                    // Cập nhật trạng thái đã duyệt
                    await reloadedNumberPlate.update(
                        {
                            status: "approved",
                            adminId: admin.id,
                        },
                        { transaction }
                    );

                    // Gửi email thông báo duyệt
                    const user = numberPlate.Student?.User;
                    if (user?.email) {
                        emailTasks.push(
                            sendMail({
                                to: user.email,
                                subject: "Đơn đăng ký biển số xe của bạn đã được duyệt!!",
                                html: `
                                    <h3>Xin chào ${user.name}</h3>
                                    <p>Đơn đăng ký biển số xe của bạn đã được <strong>duyệt</strong>.</p>
                                    <p>Biển số: ${reloadedNumberPlate.number}</p>
                                    <p>Bây giờ bạn có thể sử dụng biển số này để đăng ký vào ký túc xá.</p>
                                    <p>RoomLink xin cảm ơn!</p>
                                `,
                            })
                        );
                    }

                    approvedList.push(numberPlate.id);

                } catch (innerErr) {
                    // Nếu lỗi cục bộ (1 đơn) → ghi log, không rollback
                    skippedList.push({
                        numberPlateId: numberPlate.id,
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

    rejectNumberPlate: async (rejectNumberPlateRequest) => {
        const transaction = await sequelize.transaction();
        try {
            const numberPlates = await NumberPlate.findAll({
                where: { id: rejectNumberPlateRequest.ids },
                include: [
                    {
                        model: Student,
                        attributes: ["id", "userId"],
                        include: [
                            {
                                model: User,
                                attributes: ["id", "name", "email"],
                            },
                        ],
                    },
                ],
                transaction,
            });

            if (numberPlates.length === 0) {
                throw NumberPlateError.IdNotFound();
            }

            const rejectedList = [];
            const skippedList = [];
            const emailTasks = [];

            for (const numberPlate of numberPlates) {
                try {
                    // Kiểm tra xem đơn này đã được xử lý chưa
                    if (numberPlate.status === "approved") {
                        skippedList.push({
                            numberPlateId: numberPlate.id,
                            number: numberPlate.number,
                            reason: "Đơn này đã được duyệt rồi",
                        });
                        continue;
                    }

                    if (numberPlate.status === "rejected") {
                        skippedList.push({
                            numberPlateId: numberPlate.id,
                            number: numberPlate.number,
                            reason: "Đơn này đã bị từ chối rồi",
                        });
                        continue;
                    }

                    // Cập nhật trạng thái thành rejected (không xóa như room registration)
                    await numberPlate.update(
                        { status: "rejected" },
                        { transaction }
                    );

                    const user = numberPlate.Student?.User;
                    if (user?.email) {
                        // Lấy lý do riêng cho đơn này, hoặc lý do chung
                        const reason = rejectNumberPlateRequest.reasons?.[numberPlate.id] || "";
                        const reasonText = reason
                            ? `<p><strong>Lý do từ chối:</strong> ${reason}</p>`
                            : "";

                        emailTasks.push(
                            sendMail({
                                to: user.email,
                                subject: "Thông báo: Đơn đăng ký biển số xe bị từ chối",
                                html: `
                                    <h3>Xin chào ${user.name}</h3>
                                    <p>Rất tiếc, đơn đăng ký biển số xe của bạn đã bị <strong>từ chối</strong>.</p>
                                    <p>Biển số: ${numberPlate.number}</p>
                                    ${reasonText}
                                    <p>Nếu bạn muốn, bạn có thể đăng ký lại sau khi điều chỉnh thông tin.</p>
                                    <p>RoomLink cảm ơn bạn.</p>                            
                                `,
                            })
                        );
                    }

                    rejectedList.push(numberPlate.id);
                } catch (innerErr) {
                    skippedList.push({
                        numberPlateId: numberPlate.id,
                        reason: innerErr.message || "Unknown error",
                    });
                }
            }

            await transaction.commit();
            await Promise.allSettled(emailTasks);

            return {
                rejected: rejectedList,
                skipped: skippedList,
            };
        } catch (err) {
            if (!transaction.finished) await transaction.rollback();
            throw err;
        }
    },
};
module.exports = numberPlateServices;