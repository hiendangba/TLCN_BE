const {
    Admin,
    MeterReading,
    Room,
    Student,
    RoomRegistration,
    RoomSlot,
    sequelize
} = require("../models");
const UserError = require("../errors/UserError");
const MeterReadingError = require("../errors/MeterReadingError")
const {
    Op,
} = require("sequelize");
const paymentService = require("../services/payment.service");

const meterReadingService = {
    getMeterReadingRequest: async (getMeterReadingRequest) => {
        try {
            const {
                page = 1, limit = 10, keyword = ""
            } = getMeterReadingRequest;
            const offset = (page - 1) * limit;

            const searchCondition = keyword ? {
                [Op.or]: [{
                    type: keyword
                }, {
                    peroid: keyword
                }, {
                    "$Room.roomNumber": {
                        [Op.like]: `%${keyword}%`
                    }
                }, ]
            } : {};

            const result = await MeterReading.findAndCountAll({
                where: {
                    ...searchCondition,
                },
                include: [{
                    model: Room,
                    attributes: ["id", "roomNumber"]
                }],
                offset,
                limit,
                order: [
                    ["createdAt", "DESC"]
                ]
            })

            const response = result.rows.map((item) => {
                return {
                    id: item.id,
                    roomId: item.Room.id,
                    roomNumber: item.Room.roomNumber,
                    type: item.type,
                    oldValue: item.oldValue,
                    newValue: item.newValue,
                    unitPrice: item.unitPrice,
                    totalAmount: item.totalAmount,
                    period: item.period,
                    adminId: item.adminId,
                    readingDate: item.readingDate
                }
            })

            return {
                totalItems: result.count,
                response: response,
            }
        } catch (err) {
            console.log(err);
            throw err;
        }
    },

    createMeterReading: async (createMeterReadingRequest, userId) => {
        const transaction = await sequelize.transaction();

        try {
            // 1️⃣ Kiểm tra admin
            const admin = await Admin.findOne({
                where: {
                    userId
                }
            });
            if (!admin) throw UserError.InvalidUser();

            // 2️⃣ Kiểm tra period
            const currentPeriod = new Date().toISOString().slice(0, 7);
            const {
                period,
                listMeterReading
            } = createMeterReadingRequest;

            if (period !== currentPeriod) {
                throw MeterReadingError.InValidPeriod();
            }

            // 3️⃣ Lấy roomId
            const roomIds = listMeterReading.map(r => r.roomId);

            // 4️⃣ Lấy room + meterReading kỳ này
            const existingRooms = await Room.findAll({
                where: {
                    id: {
                        [Op.in]: roomIds
                    }
                },
                include: [{
                    model: MeterReading,
                    as: "MeterReadings",
                    where: {
                        period
                    },
                    required: false
                }],
                transaction
            });

            // 5️⃣ Kiểm tra room không tồn tại
            const dbRoomIdsSet = new Set(existingRooms.map(r => r.id));
            const invalidRooms = roomIds.filter(id => !dbRoomIdsSet.has(id));
            if (invalidRooms.length > 0) {
                const msg = invalidRooms.map(id => `Phòng có id: ${id} không tồn tại`).join("; ");
                throw MeterReadingError.InvalidRoomIds(msg);
            }

            // 6️⃣ Kiểm tra phòng đã nhập kỳ này rồi
            const enteredRooms = existingRooms.filter(
                r => Array.isArray(r.MeterReadings) && r.MeterReadings.length > 0
            );
            if (enteredRooms.length > 0) {
                const msg = enteredRooms.map(r => `Phòng có id: ${r.id} đã được nhập hóa đơn cho kỳ này`).join("; ");
                throw MeterReadingError.AlreadyExistsForPeriod(msg);
            }

            // 7️⃣ Xử lý dữ liệu meterReading
            const handledMeterReadings = listMeterReading.map(item => ({
                ...item,
                totalAmount: Math.round(item.newValue - item.oldValue),
                readingDate: new Date(),
                adminId: admin.id,
                period: period
            }));

            // 8️⃣ Chuẩn bị payment list
            const paymentList = [];

            // xử lý từng meterReading tuần tự (for..of để await được)
            for (const item of handledMeterReadings) {

                // Lấy danh sách sinh viên trong phòng
                const roomSlots = await RoomSlot.findAll({
                    where: {
                        roomId: item.roomId
                    },
                    include: [{
                        model: RoomRegistration,
                        where: {
                            status: "CONFIRMED"
                        },
                        include: [{
                            model: Student
                        }]
                    }],
                    transaction
                });

                const students = roomSlots.flatMap(slot =>
                    slot.RoomRegistrations.map(reg => reg.Student)
                );

                // Tạo từng payment
                for (const student of students) {
                    const typeString = item.type === "electricity" ? "điện" : "nước";
                    const content = `Thanh toán tiền ${typeString} - ${item.period}`;
                    const amount = Number(item.totalAmount) * Number(item.unitPrice);

                    paymentList.push({
                        amount,
                        type: item.type.toUpperCase(),
                        content,
                        studentId: student.id
                    });
                }
            }

            // 9️⃣ Tạo payment trong transaction
            await paymentService.createPayment(paymentList);

            // 🔟 Lưu meterReading trong transaction
            const result = await MeterReading.bulkCreate(handledMeterReadings, {
                returning: true,
                transaction
            });

            // 1️⃣1️⃣ Commit
            await transaction.commit();
            return result;

        } catch (err) {
            // ❗Rollback nếu lỗi
            await transaction.rollback();
            throw err;
        }
    }

}

module.exports = meterReadingService;