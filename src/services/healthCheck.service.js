const {
    Admin,
    HealthCheck,
    Building,
    RegisterHealthCheck,
    Student,
    User
} = require("../models");
const BuildingError = require("../errors/BuildingError");
const HealthCheckError = require("../errors/HealthCheckError");
const UserError = require("../errors/UserError");
const {
    Op,
} = require("sequelize");



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
    getRegisterHealthCheck: async (getRegisterHealthCheckRequest) => {
        try {
            const {
                page = 1, limit = 10, keyword = ""
            } = getRegisterHealthCheckRequest;
            const offset = (page - 1) * limit;

            const searchCondition = keyword ?
                {
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
                } :
                {};

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
        try {
            const admin = await Admin.findOne({
                where: {
                    userId
                }
            });
            if (!admin) throw UserError.InvalidUser();

            let healthCheck = await HealthCheck.findByPk(id);
            if (!healthCheck) {
                throw HealthCheckError.NotFound();
            }

            await healthCheck.update({
                status: "inactive",
                updatedAt: new Date()
            })

            return "Xóa đợt khám thành công";
        } catch (err) {
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
                    attributes: ['id', 'name', 'identification'], // chỉ lấy field name
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

            // them no vao db thoi
            const registered = await RegisterHealthCheck.create({
                ...registerHealthCheckRequest,
                studentId: student.id
            });

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
            endDate
        } = getHealthCheckRequest;
        let whereClause = {};
        if (startDate && endDate) {
            // Nếu có cả 2 — lọc các đợt khám trùng / nằm trong khoảng
            whereClause = {
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
                // status: "active"
            };
        } else if (startDate) {
            // Chỉ có startDate → lấy đợt khám còn sau này này là được 
            whereClause = {
                endDate: {
                    [Op.gte]: startDate
                },
                // status: "active"
            };
        } else if (endDate) {
            // Chỉ có endDate → lấy đợt khám kết thúc trước hoặc bằng ngày đó
            whereClause = {
                startDate: {
                    [Op.lte]: endDate
                },
                // status: "active"
            };
        } else {
            whereClause = {
                // status: "active"
            }
        }

        console.log('WHERE CLAUSE:', JSON.stringify(whereClause, null, 2));
        const existingHealthChecks = await HealthCheck.findAll({
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
            order: [
                ["startDate", "DESC"]
            ],
        });

        const result = existingHealthChecks.map(hc => {
            return {
                id: hc.id,
                title: hc.title,
                description: hc.description,
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
        return result;
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