const {
    Admin,
    MeterReading,
    Room,
} = require("../models");
const UserError = require("../errors/UserError");
const MeterReadingError = require("../errors/MeterReadingError")

const meterReadingService = {
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