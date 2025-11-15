const {
    Admin,
    MeterReading,
    Room,
} = require("../models");
const UserError = require("../errors/UserError");
const MeterReadingError = require("../errors/MeterReadingError")
const {
    Op,
} = require("sequelize");

const meterReadingService = {
    getMeterReadingRequest: async (getMeterReadingRequest) => {
        try{
            const { page = 1, limit = 10, keyword = "" } = getMeterReadingRequest;
            const offset =  ( page - 1 ) * limit;

            const searchCondition = keyword ? {
                [Op.or]: [{
                    type: keyword
                }, {
                    peroid: keyword
                },{
                    "$Room.roomNumber": {
                        [Op.like]: `%${keyword}%`
                    }
                },]
            } : {};

            const result = await MeterReading.findAndCountAll({
                where: {
                    ... searchCondition,
                },
                include:[
                    {
                        model: Room,
                        attributes: ["id", "roomNumber"]
                    }
                ],
                offset,
                limit,
                order: [
                    ["createdAt", "DESC"]
                ]
            })

            const response = result.rows.map ((item) => {
                return {
                    id: item.id,
                    roomId: item.Room.id,
                    roomNumber:  item.Room.roomNumber,
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
        }
        catch(err){
            console.log(err);
            throw err;
        }
    },

    createMeterReading: async (createMeterReadingRequest, userId) => {
        try {
            // Kiểm tra userId có tồn tại không
            const admin = await Admin.findOne({ where: { userId } });
            if (!admin) throw UserError.InvalidUser();

            // Kiểm tra period có đúng tháng/năm hiện tại không
            const currentPeriod = new Date().toISOString().slice(0, 7); // ví dụ: "2025-11"
            const { period, listMeterReading } = createMeterReadingRequest;
            
            if (period != currentPeriod) {
                throw MeterReadingError.InValidPeriod();
            }

            // Lấy danh sách roomId từ request
            const roomIds = listMeterReading.map(r => r.roomId);

            //  Lấy danh sách room có thật, kèm meterReading (nếu có cùng kỳ)
            const existingRooms = await Room.findAll({
                where: {
                    id: roomIds
                },
                include: [{
                    model: MeterReading,
                    as: "MeterReadings",
                    where: {
                        period: period
                    },
                    required: false,
                }],
            });
            
            // Kiểm tra roomId nào không tồn tại trong DB
            const dbRoomIdsSet  = new Set(existingRooms.map(r => r.id));
            const invalidRooms = roomIds.filter(id => !dbRoomIdsSet.has(id));

            if (invalidRooms.length > 0){
                const msg = invalidRooms.map(id => `Phòng có id: ${id} không tồn tại`).join("; ");
                throw MeterReadingError.InvalidRoomIds(msg);
            }

            //  Kiểm tra phòng nào đã nhập kỳ này rồi
            const enteredRooms = existingRooms.filter(
                r => Array.isArray(r.MeterReadings) && r.MeterReadings.length > 0
            );

            if (enteredRooms.length > 0) {
                const msg = enteredRooms.map(r => `Phòng có id: ${r.id} đã được nhập hóa đơn cho kỳ này`).join("; ");
                throw MeterReadingError.AlreadyExistsForPeriod(msg);
            }

            // Xử lý dữ liệu trước khi lưu
            const handledMeterReadings = listMeterReading.map(item => ({
                ...item,
                totalAmount: Math.round(item.newValue - item.oldValue),
                readingDate: new Date(),
                adminId: admin.id,
                period: period
            }));

            // Lưu nhiều bản ghi cùng lúc
            return await MeterReading.bulkCreate(handledMeterReadings, {
                returning: true
            })

        } catch (err) {
            throw err;
        }
    }
}

module.exports = meterReadingService;