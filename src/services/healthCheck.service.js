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
const e = require("express");



const formatDate = (date) => {
  const iso = date.toISOString();
  return iso.replace('T', ' ').slice(0, 19);
};
const formatDateRange = (start, end) => `${formatDate(start)} - ${formatDate(end)}`;

const healthCheckService = {

    deleteHealthCheck: async ( id, userId ) => {
        try{
            const admin = await Admin.findOne({
                where: {
                    userId
                }
            });
            if (!admin) throw UserError.InvalidUser();

            let healthCheck = await HealthCheck.findByPk(id);
            if (!healthCheck){
                throw HealthCheckError.NotFound();
            }

            await healthCheck.update({
                status : "inactive",
                updatedAt: new Date()
            })

            return "Xóa đợt khám thành công";
        }
        catch (err){
            throw err;
        }
        
    },

    registerHealthCheck: async ( registerHealthCheckRequest ) => {
        try {
            const { studentId, healthCheckId } = registerHealthCheckRequest;
            // kiem tra user co ton tai hong
            const student = await Student.findByPk(studentId, {
                include: [
                    {
                        model: User,          // bảng liên quan
                        attributes: ['name'], // chỉ lấy field name
                    }
                ]
            });

            if (!student){
                throw UserError.InvalidUser();
            }
            // kiem tra dot kham co ton tai khong va con slot khong 
            const existingHealthCheck =  await HealthCheck.findByPk(healthCheckId, {
                include: [
                    { 
                        model: RegisterHealthCheck,
                        as: "RegisterHealthChecks",
                        attributes: ["id", "studentId"], // lấy các bản đăng ký
                    },
                    { 
                        model: Building,
                        as: "Building",
                        attributes: ["name"], // lấy building
                    }
                ]
            })
            // Kiểm tra tồn tại
            if (!existingHealthCheck){
                throw HealthCheckError.NotFound()
            }
            // Kiểm tra còn thời hạn hay không
            if (existingHealthCheck.registrationStartDate && existingHealthCheck.registrationEndDate ){
                const now = new Date();
                const start  = new Date(existingHealthCheck.registrationStartDate);
                const end  = new Date(existingHealthCheck.registrationEndDate);
                if (now.getTime() < start.getTime() || now.getTime() > end.getTime()) {
                    throw HealthCheckError.RegistrationDueReached();
                }
            }
            if (existingHealthCheck.RegisterHealthChecks.length >= existingHealthCheck.capacity){
                throw HealthCheckError.RegistrationLimitReached()
            }

            
            // kiem tra user nay da dang ki dot kham chua
            const isRegistered = existingHealthCheck.RegisterHealthChecks.some( item => item.studentId === studentId);

            if (isRegistered){
                throw HealthCheckError.AlreadyRegistered();
            }

            // them no vao db thoi
            const registered = await RegisterHealthCheck.create(registerHealthCheckRequest);

            // chuyen no thanh DTO
            const result = {
                studentId: registered.studentId,
                healthCheckId: registered.healthCheckId,
                studentName: student.User.name,
                healthCheckTitle: existingHealthCheck.title,
                healthCheckBuilding: existingHealthCheck.Building.name,
                period: formatDateRange(existingHealthCheck.startDate, existingHealthCheck.endDate),
                fee: existingHealthCheck.price,
                dueDate: formatDate(existingHealthCheck.endDate),
                registerDate: formatDate(registered.registerDate),
                note: registered.note
            };
            return result;
        }
        catch (err){
            throw err;
        }
    },

    getHealthCheck: async (getHealthCheckRequest) => {
        const { startDate, endDate } = getHealthCheckRequest;
        let whereClause = {};
        if (startDate && endDate) {
            // Nếu có cả 2 — lọc các đợt khám trùng / nằm trong khoảng
            whereClause = {
                [Op.or]: [
                    {
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
                        [Op.and]: [
                            { startDate: { [Op.lte]: startDate } },
                            { endDate: { [Op.gte]: endDate } },
                        ],
                    },
                ],
                status: "active"
            };
        } else if (startDate) {
            // Chỉ có startDate → lấy đợt khám còn sau này này là được 
            whereClause = {
                endDate: { [Op.gte]: startDate },
                status: "active"
            };
        } else if (endDate) {
            // Chỉ có endDate → lấy đợt khám kết thúc trước hoặc bằng ngày đó
            whereClause = {
                startDate: { [Op.lte]: endDate },
                status: "active"
            };
        } 

        const existingHealthChecks = await HealthCheck.findAll({
            where: whereClause,
            include: [
                {
                    model: Building,
                    as: "Building",
                    attributes: ["name"],
                },
                { 
                    model: RegisterHealthCheck,
                    as: "RegisterHealthChecks",
                    attributes: ["id", "studentId"], // lấy các bản đăng ký
                }
            ],
            order: [["startDate", "ASC"]],
        });

        const result = existingHealthChecks.map( hc => {
            return{
                title: hc.title,
                description: hc.description,
                location: hc.location,
                startDate: formatDate(hc.startDate),
                endDate: formatDate(hc.endDate),
                capacity: hc.capacity,
                price: hc.price,
                buildingName: hc.Building?.name || null,
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
                ]
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

            if (healthCheckId){
                let healthCheck = await HealthCheck.findByPk(healthCheckId);
                if (!healthCheck){
                    throw HealthCheckError.NotFound();
                }
                entered = await healthCheck.update({
                    ...createHealthCheckRequest,
                    adminId: admin.id
                },
                { returning: true })
            }
            else{
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