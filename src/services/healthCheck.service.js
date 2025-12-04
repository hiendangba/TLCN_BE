const {
    Admin,
    HealthCheck,
    Building,
    RegisterHealthCheck,
    Student,
    User,
} = require("../models");
const BuildingError = require("../errors/BuildingError");
const HealthCheckError = require("../errors/HealthCheckError");
const UserError = require("../errors/UserError");
const sendMail = require("../utils/mailer")
const {
    Op,
} = require("sequelize");
const {
    sequelize
} = require("../config/database");
const paymentService = require("../services/payment.service");
const momoUtils = require("../utils/momo.util");
const PaymentError = require("../errors/PaymentError");


const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};
const formatDateRange = (start, end) => `${formatDate(start)} - ${formatDate(end)}`;
const checkTimeConstraint = (registerDate, existingHealthCheck) => {
    // Kiem tra gio co hop le hay hong
    const today = new Date();
    const date = new Date(registerDate);
    const start = new Date(existingHealthCheck.startDate);
    const end = new Date(existingHealthCheck.endDate);
    const registerStartDate = new Date(existingHealthCheck.registrationStartDate);
    const registerEndDate = new Date(existingHealthCheck.registrationEndDate);

    // Kiem tra xem con thoi han dang ky hong
    if (today.getTime() < registerStartDate.getTime() || today.getTime() > registerEndDate.getTime()) {
        throw HealthCheckError.RegistrationDueReached();
    }

    // Kiem tra thoi gian dang ky kham co nam trong khoang thoi gian kham hay khong
    if (date.getTime() < start.getTime() || date.getTime() > end.getTime()) {
        throw HealthCheckError.InvalidRegisterDate();
    }

    // Kiem tra cái này thì phải đổi sang giờ local để mà so sánh nà
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const validHour = hours >= 8 && hours <= 17;
    const validMinute = minutes % 10 === 0;
    if (!validHour || !validMinute) {
        throw HealthCheckError.InvalidTimeSlot();
    }

    // Kiem tra Timeslot da co nguoi dang ky chua 
    const listRegisterDateOfHC = existingHealthCheck.RegisterHealthChecks || [];
    const isTimeSlotExist = listRegisterDateOfHC.some(
        item => new Date(item.registerDate).getTime() === date.getTime()
    );
    if (isTimeSlotExist) {
        throw HealthCheckError.InvalidTimeSlot();
    }
}


const healthCheckService = {

    cancelRegisterHealthCheck: async (healthCheckId, userId) => {
        const transaction = await sequelize.transaction();
        try {
            const student = await Student.findOne({
                where: {
                    userId: userId
                },
                include: [{
                    model: User
                }],
                transaction
            });

            if (!student) throw UserError.UserNotFound();

            const healthCheck = await HealthCheck.findByPk(healthCheckId, {
                include: [{
                    model: RegisterHealthCheck,
                }],
                transaction
            });

            if (!healthCheck) throw HealthCheckError.NotFound();

            const registeredItem = healthCheck.RegisterHealthChecks.find(
                item => item.studentId === student.id
            );

            if (!registeredItem) throw HealthCheckError.NotRegistered();

            const oldPayment = await paymentService.getLastestPayment(student.id, "HEALTHCHECK");

            // Nếu đã thanh toán đợt cũ -> hoàn tiền
            if (oldPayment && String(oldPayment.status).toUpperCase() === "SUCCESS" && oldPayment.transId) {
                const paymentData = {
                    amount: Number(Math.abs(healthCheck.price)),
                    type: "REFUND_HEALTHCHECK",
                    content: `Hoàn tiền do hủy đợt khám: ${healthCheck.title}`
                };

                const payment = await paymentService.createPayment(paymentData);

                const {
                    bodyMoMo,
                    rawSignature
                } = momoUtils.generateMomoRawSignatureRefund(payment, oldPayment);
                const signature = momoUtils.generateMomoSignature(rawSignature);

                const refundResponse = await momoUtils.getRefund(bodyMoMo, signature);

                const isSuccessOrUnknown =
                    refundResponse.data.resultCode === 0 ||
                    refundResponse.data.resultCode === 99;

                if (!isSuccessOrUnknown || refundResponse.data.amount !== bodyMoMo.amount) {
                    throw PaymentError.InvalidAmount();
                }

                payment.status = "SUCCESS";
                payment.transId = refundResponse.data.transId;
                payment.studentId = student.id;
                payment.paidAt = new Date();
                await payment.save({
                    transaction
                });
            }

            // Xóa payment cũ
            if (oldPayment) {
                await oldPayment.destroy({
                    transaction
                });
            }

            // Hủy đăng ký
            await registeredItem.destroy({
                transaction
            });

            // Gửi email
            sendMail({
                to: student.User.email,
                subject: `Thông báo: Đợt khám "${healthCheck.title}" đã bị hủy`,
                html: `
                <h3>Xin chào ${student.User.name},</h3>
                <p>Đợt khám <strong>"${healthCheck.title}"</strong> đã bị <strong>hủy</strong>.</p>
                <ul>
                    <li><strong>Tiêu đề:</strong> ${healthCheck.title}</li>
                    <li><strong>Ngày bắt đầu:</strong> ${new Date(healthCheck.startDate).toLocaleDateString()}</li>
                    <li><strong>Ngày kết thúc:</strong> ${new Date(healthCheck.endDate).toLocaleDateString()}</li>
                </ul>
                <p>Nếu bạn đã thanh toán, vui lòng kiểm tra giao dịch hoàn tiền.</p>
            `
            });

            await transaction.commit();
            return "Hủy đợt khám thành công";
        } catch (err) {
            console.log(err);
            if (!transaction.finished) await transaction.rollback();
            throw err;
        }
    },


    getRegisterHealthCheck: async (getRegisterHealthCheckRequest) => {
        try {
            const {
                page = 1, limit = 10, keyword = ""
            } = getRegisterHealthCheckRequest;
            const offset = (page - 1) * limit;

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
                ],
            } : {};

            const registerHealthChecks = await RegisterHealthCheck.findAndCountAll({
                where: {
                    ...searchCondition,
                },
                include: [{
                        model: Student,
                        attributes: ["id", "mssv", "school", "userId"],
                        include: [{
                            model: User,
                            attributes: ["id", "name", "identification"],
                        }, ],
                    },
                    {
                        model: HealthCheck,
                        attributes: [
                            "id",
                            "title",
                            "price",
                            "startDate",
                            "endDate",
                            "registrationStartDate",
                            "registrationEndDate",
                        ],
                        include: [{
                            model: Building,
                            attributes: ["id", "name"],
                        }, ],
                    },
                ],
                offset,
                limit,
                order: [
                    ["createdAt", "DESC"]
                ],
            });

            const response = registerHealthChecks.rows.map((item) => {
                const student = item.Student;
                const user = student?.User;
                const healthCheck = item.HealthCheck;
                const building = healthCheck?.Building;

                return {
                    studentId: student?.id,
                    healthCheckId: healthCheck?.id,
                    studentName: user?.name,
                    studentIdentification: user?.identification,
                    healthCheckTitle: healthCheck?.title,
                    healthCheckBuilding: building?.name,
                    period: formatDateRange(healthCheck?.startDate, healthCheck?.endDate),
                    fee: healthCheck?.price,
                    dueDate: formatDate(healthCheck?.endDate),
                    registerDate: formatDate(item.registerDate),
                    note: item.note,
                    id: item.id,
                };
            });

            return {
                totalItems: registerHealthChecks.count,
                response: response,
            };
        } catch (err) {
            console.log(err);
            throw err;
        }
    },

    deleteHealthCheck: async (id, userId) => {
        const transaction = await sequelize.transaction();
        try {
            const admin = await Admin.findOne({
                where: {
                    userId
                },
                transaction
            });
            if (!admin) throw UserError.InvalidUser();

            const healthCheck = await HealthCheck.findByPk(id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!healthCheck) throw HealthCheckError.NotFound();

            const registrations = await RegisterHealthCheck.findAll({
                where: {
                    healthCheckId: id
                },
                include: [{
                    model: Student,
                    include: [{
                        model: User
                    }]
                }],
                transaction
            });

            const hasRegistrations = registrations.length > 0;
            const isActive = healthCheck.status === 'active';

            if (isActive && hasRegistrations) {
                // chỉ inactive thôi
                await healthCheck.update({
                    status: "inactive",
                    updatedAt: new Date()
                }, {
                    transaction
                });

                await transaction.commit();
                return "Đợt khám đã được chuyển sang trạng thái tạm dừng";
            }

            // =========================================
            // XÓA HOÀN TOÀN + HOÀN TIỀN + GỬI EMAIL
            // =========================================

            let emailTasks = [];

            for (const reg of registrations) {
                const student = reg.Student;

                const oldPayment = await paymentService.getLastestPayment(student.id, "HEALTHCHECK");

                // const oldPayment = await paymentService.getPaymentByStudentId(student.id, "HEALTHCHECK");

                if (String(oldPayment.status).toUpperCase() === "SUCCESS" && oldPayment.transId != null) {
                    console.log(oldPayment.toJSON());
                    const paymentData = {
                        amount: Number(Math.abs(healthCheck.price)),
                        type: "REFUND_HEALTHCHECK",
                        content: `Hoàn tiền do hủy đợt khám: ${healthCheck.title}`
                    };

                    const payment = await paymentService.createPayment(paymentData);

                    const {
                        bodyMoMo,
                        rawSignature
                    } = momoUtils.generateMomoRawSignatureRefund(payment, oldPayment);
                    const signature = momoUtils.generateMomoSignature(rawSignature);

                    const refundResponse = await momoUtils.getRefund(bodyMoMo, signature);

                    console.log("Đã call dc vào API");
                    console.log("Data tu momo", refundResponse);
                    const isSuccessOrUnknown = refundResponse.data.resultCode === 0 || refundResponse.data.resultCode === 99;

                    if (!isSuccessOrUnknown || refundResponse.data.amount !== bodyMoMo.amount) {
                        throw PaymentError.InvalidAmount();
                    }

                    console.log("Đã call dc vào API");

                    payment.status = "SUCCESS";
                    payment.transId = refundResponse.data.transId;
                    payment.studentId = student.id;
                    payment.paidAt = new Date();
                    await payment.save();
                }

                await oldPayment.destroy({
                    transaction
                });

                // Tạo mail
                emailTasks.push(
                    sendMail({
                        to: student.User.email,
                        subject: `Thông báo: Đợt khám "${healthCheck.title}" đã bị hủy`,
                        html: `
                            <h3>Xin chào ${student.User.name},</h3>
                            <p>Đợt khám <strong>"${healthCheck.title}"</strong> đã bị <strong>hủy</strong>.</p>
                            <ul>
                                <li><strong>Tiêu đề:</strong> ${healthCheck.title}</li>
                                <li><strong>Ngày bắt đầu:</strong> ${new Date(healthCheck.startDate).toLocaleDateString()}</li>
                                <li><strong>Ngày kết thúc:</strong> ${new Date(healthCheck.endDate).toLocaleDateString()}</li>
                            </ul>
                            <p>Nếu bạn đã thanh toán, vui lòng kiểm tra giao dịch hoàn tiền.</p>
                        `,
                    })
                );
            }

            // Xóa đăng ký
            await RegisterHealthCheck.destroy({
                where: {
                    healthCheckId: id
                },
                transaction
            });

            // Xóa đợt khám
            await healthCheck.destroy({
                transaction
            });

            await transaction.commit();

            // gửi mail ngoài transaction
            await Promise.allSettled(emailTasks);

            return "Xóa đợt khám thành công";

        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },


    registerHealthCheck: async (registerHealthCheckRequest, userId) => {
        try {
            const {
                healthCheckId,
                registerDate
            } = registerHealthCheckRequest;

            // kiem tra user co ton tai hong
            const student = await Student.findOne({
                where: {
                    userId: userId,
                },
                include: [{
                    model: User, // bảng liên quan
                    attributes: ['id', 'name', 'identification', "email"], // chỉ lấy field name
                }]
            });

            if (!student) {
                throw UserError.InvalidUser();
            }

            const existingHealthCheck = await HealthCheck.findByPk(healthCheckId, {
                include: [{
                        model: RegisterHealthCheck,
                        as: "RegisterHealthChecks",
                        attributes: ["id", "studentId", "registerDate"], // lấy các bản đăng ký
                    },
                    {
                        model: Building,
                        as: "Building",
                        attributes: ["name"], // lấy building
                    }
                ]
            })

            if (!existingHealthCheck) {
                throw HealthCheckError.NotFound()
            }

            // Kiem tra dot kham con slot dang ky khong
            if (existingHealthCheck.RegisterHealthChecks.length >= existingHealthCheck.capacity) {
                throw HealthCheckError.RegistrationLimitReached()
            }

            // Kiem tra ca rang buoc ve mat thoi gian
            checkTimeConstraint(registerDate, existingHealthCheck);


            // kiem tra user nay da dang ki dot kham chua
            const isRegistered = existingHealthCheck.RegisterHealthChecks.some(item => item.studentId === student.id);

            if (isRegistered) {
                throw HealthCheckError.AlreadyRegistered();
            }

            // kiểm tra user này đã thanh toán chưa, nếu chưa thì không cho đăng ký đợt khám

            const hasPendingHealthCheckPayment = await paymentService.hasPendingHealthCheckPayment(student.id, "HEALTHCHECK");
            if (hasPendingHealthCheckPayment) {
                throw HealthCheckError.NotPaid();
            }

            // them no vao db thoi
            const registered = await RegisterHealthCheck.create({
                ...registerHealthCheckRequest,
                studentId: student.id
            });

            if (registered) {
                // tao ra payment cho registerHealCheck
                const payment = {
                    content: `${existingHealthCheck.title}`,
                    type: "HEALTHCHECK",
                    amount: Number(existingHealthCheck.price),
                    studentId: student.id
                };
                await paymentService.createPayment(payment);

                // gửi mail thông báo về cho sinh viên
                sendMail({
                    to: student.User.email,
                    subject: `Xác nhận đăng ký đợt khám "${existingHealthCheck.title}" thành công`,
                    html: `
                        <h3>Xin chào ${student.User.name},</h3>

                        <p>Bạn đã đăng ký thành công đợt khám <strong>"${existingHealthCheck.title}"</strong>.</p>

                        <p>Vui lòng có mặt lúc ${new Date(registerDate).toLocaleDateString()} tại ${existingHealthCheck.Building.name} để đảm bảo quá trình khám diễn ra thuận lợi.</p>

                        <p>Thông tin đợt khám:</p>
                        <ul>
                            <li><strong>Tiêu đề:</strong> ${existingHealthCheck.title}</li>
                            <li><strong>Ngày bắt đầu:</strong> ${new Date(existingHealthCheck.startDate).toLocaleDateString()}</li>
                            <li><strong  >Ngày kết thúc:</strong> ${new Date(existingHealthCheck.endDate).toLocaleDateString()}</li>
                        </ul> 

                        <p> Lưu ý: Hãy vào mục thanh toán của hệ thống để thanh toán chi phí khám sức khỏe </p>

                        <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với ban quản lý để được hỗ trợ.</p>

                        <p>Trân trọng,</p>
                        <p>Đội ngũ quản lý hệ thống</p>
                    `,
                })
            }

            // chuyen no thanh DTO
            const result = {
                studentId: registered.studentId,
                healthCheckId: registered.healthCheckId,
                studentName: student.User.name,
                studentIdentification: student.User.identification,
                healthCheckTitle: existingHealthCheck.title,
                healthCheckBuilding: existingHealthCheck.Building.name,
                period: formatDateRange(existingHealthCheck.startDate, existingHealthCheck.endDate),
                fee: existingHealthCheck.price,
                dueDate: formatDate(existingHealthCheck.endDate),
                registerDate: formatDate(registered.registerDate),
                note: registered.note
            };
            return result;

        } catch (err) {
            throw err;
        }
    },

    getHealthCheck: async (getHealthCheckRequest) => {
        const {
            startDate,
            endDate,
            status,
            availableForRegistration,
            page = 1,
            limit = 10,
        } = getHealthCheckRequest;

        const offset = (page - 1) * limit;

        let whereClause = {};

        // If availableForRegistration is true, only get active status
        if (availableForRegistration) {
            whereClause.status = "active";
        } else if (status) {
            // If status filter is explicitly provided, use it
            whereClause.status = status;
        }
        // If no status filter is provided, don't filter by status (show all: active and inactive)

        if (startDate && endDate) {
            // Nếu có cả 2 — lọc các đợt khám trùng / nằm trong khoảng
            whereClause = {
                ...whereClause,
                [Op.or]: [{
                        startDate: {
                            [Op.between]: [startDate, endDate],
                        },
                    },
                    {
                        endDate: {
                            [Op.between]: [startDate, endDate],
                        },
                    },
                    {
                        [Op.and]: [{
                                startDate: {
                                    [Op.lte]: startDate
                                }
                            },
                            {
                                endDate: {
                                    [Op.gte]: endDate
                                }
                            },
                        ],
                    },
                ],
            };
        } else if (startDate) {
            // Chỉ có startDate → lấy đợt khám còn sau này này là được 
            whereClause = {
                ...whereClause,
                endDate: {
                    [Op.gte]: startDate
                },
            };
        } else if (endDate) {
            // Chỉ có endDate → lấy đợt khám kết thúc trước hoặc bằng ngày đó
            whereClause = {
                ...whereClause,
                startDate: {
                    [Op.lte]: endDate
                },
            };
        }

        console.log('WHERE CLAUSE:', JSON.stringify(whereClause, null, 2));

        // Determine order: prioritize active status when no status filter
        let orderClause;
        if (!status) {
            // Khi không có filter status, ưu tiên active trước, sau đó sắp xếp theo startDate DESC
            orderClause = [
                [sequelize.literal("CASE WHEN `HealthCheck`.`status` = 'active' THEN 0 ELSE 1 END"), 'ASC'],
                ["startDate", "DESC"]
            ];
        } else {
            // Khi có filter status, chỉ sắp xếp theo startDate DESC
            orderClause = [
                ["startDate", "DESC"]
            ];
        }

        const {
            count,
            rows: existingHealthChecks
        } = await HealthCheck.findAndCountAll({
            where: whereClause,
            include: [{
                    model: Building,
                    as: "Building",
                    attributes: ["id", "name"],
                },
                {
                    model: RegisterHealthCheck,
                    as: "RegisterHealthChecks",
                    attributes: ["id", "studentId"], // lấy các bản đăng ký
                }
            ],
            order: orderClause,
            limit: limit,
            offset: offset,
        });

        const now = new Date();
        let filteredHealthChecks = existingHealthChecks;
        let totalCount = count;

        // Filter by availableForRegistration if requested
        if (availableForRegistration) {
            filteredHealthChecks = existingHealthChecks.filter(hc => {
                const registeredCount = (hc.RegisterHealthChecks || []).length;
                const registrationStartDate = new Date(hc.registrationStartDate);
                const registrationEndDate = new Date(hc.registrationEndDate);

                // Check if registration is open: status is active, within registration period, and not full
                return hc.status === 'active' &&
                    registrationStartDate <= now &&
                    now <= registrationEndDate &&
                    registeredCount < hc.capacity;
            });
            // Update totalCount for availableForRegistration filter
            totalCount = filteredHealthChecks.length;
        }

        const result = filteredHealthChecks.map(hc => {
            return {
                id: hc.id,
                title: hc.title,
                // description removed from list - only available in detail endpoint
                location: hc.location,
                startDate: formatDate(hc.startDate),
                endDate: formatDate(hc.endDate),
                capacity: hc.capacity,
                price: hc.price,
                buildingName: hc.Building?.name || null,
                buildingId: hc.Building?.id || null,
                registeredCount: (hc.RegisterHealthChecks || []).length,
                registrationStartDate: formatDate(hc.registrationStartDate),
                registrationEndDate: formatDate(hc.registrationEndDate),
                status: hc.status
            }
        });
        return {
            data: result,
            totalItems: totalCount
        };
    },

    getHealthCheckById: async (id) => {
        const healthCheck = await HealthCheck.findByPk(id, {
            include: [{
                    model: Building,
                    as: "Building",
                    attributes: ["id", "name"],
                },
                {
                    model: RegisterHealthCheck,
                    as: "RegisterHealthChecks",
                    attributes: ["id", "studentId"],
                }
            ]
        });

        if (!healthCheck) {
            throw HealthCheckError.NotFound();
        }

        return {
            id: healthCheck.id,
            title: healthCheck.title,
            description: healthCheck.description,
            location: healthCheck.location,
            startDate: formatDate(healthCheck.startDate),
            endDate: formatDate(healthCheck.endDate),
            capacity: healthCheck.capacity,
            price: healthCheck.price,
            buildingName: healthCheck.Building?.name || null,
            buildingId: healthCheck.Building?.id || null,
            registeredCount: (healthCheck.RegisterHealthChecks || []).length,
            registrationStartDate: formatDate(healthCheck.registrationStartDate),
            registrationEndDate: formatDate(healthCheck.registrationEndDate),
            status: healthCheck.status
        };
    },

    createHealthCheck: async (createHealthCheckRequest, userId) => {
        try {
            // Kiem tra admin co ton tai khong
            const admin = await Admin.findOne({
                where: {
                    userId
                }
            });
            if (!admin) throw UserError.InvalidUser();

            // Kiem tra toa nha co ton tai khong
            const {
                buildingId,
                startDate,
                endDate,
                healthCheckId
            } = createHealthCheckRequest;

            const building = await Building.findByPk(buildingId);
            if (!building) {
                throw BuildingError.NotFound();
            }

            const whereClause = {
                buildingId,
                [Op.or]: [{
                        startDate: {
                            [Op.between]: [startDate, endDate] // startDate của đợt cũ nằm trong khoảng mới
                        }
                    },
                    {
                        endDate: {
                            [Op.between]: [startDate, endDate] // endDate của đợt cũ nằm trong khoảng mới
                        }
                    },
                    {
                        [Op.and]: [{
                                startDate: {
                                    [Op.lte]: startDate
                                }
                            }, // đợt cũ bắt đầu trước
                            {
                                endDate: {
                                    [Op.gte]: endDate
                                }
                            } // và kết thúc sau (bao trùm đợt mới)
                        ]
                    }
                ],
                status: "active",
            };

            if (healthCheckId) {
                whereClause.id = {
                    [Op.ne]: healthCheckId
                }
            }

            // Kiem tra thoi diem kham co hop le hay khong
            const existingHealthCheck = await HealthCheck.findOne({
                where: whereClause
            })

            if (existingHealthCheck) {
                throw HealthCheckError.AlreadyExistsInPeriod();
            }

            let entered;

            if (healthCheckId) {
                let healthCheck = await HealthCheck.findByPk(healthCheckId);
                if (!healthCheck) {
                    throw HealthCheckError.NotFound();
                }
                entered = await healthCheck.update({
                    ...createHealthCheckRequest,
                    adminId: admin.id
                }, {
                    returning: true
                })
            } else {
                entered = await HealthCheck.create({
                    ...createHealthCheckRequest,
                    adminId: admin.id
                })
            }

            const response = {
                id: entered.id,
                title: entered.title,
                description: entered.description,
                startDate: formatDate(entered.startDate),
                endDate: formatDate(entered.endDate),
                capacity: entered.capacity,
                registeredCount: 0,
                buildingName: building.name,
                price: entered.price,
                registrationStartDate: formatDate(entered.registrationStartDate),
                registrationEndDate: formatDate(entered.registrationEndDate),
                status: entered.status
            }

            return response;

        } catch (err) {
            throw err;
        }
    },
};
module.exports = healthCheckService;