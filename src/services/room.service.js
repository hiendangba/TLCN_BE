const {
    Room,
    RoomRegistration,
    RoomSlot,
    RoomType,
    Floor,
    Building,
    Student,
    User,
    sequelize,
    Admin
} = require("../models");
const floorServices = require("./floor.service");
const RoomError = require("../errors/RoomError");
const RoomRegistrationError = require("../errors/RoomRegistrationError")
const FloorError = require("../errors/FloorError");
const UserError = require("../errors/UserError")
const {
    Op,
    where
} = require("sequelize");
const {
    RejectRoomRegistrationRequest
} = require("../dto/request/roomRegistration.request");
const roomRegistrationService = require("../services/roomRegistration.service");

const roomServices = {
    createRoomType: async (createRoomTypeRequest) => {
        try {
            const roomType = await RoomType.create(createRoomTypeRequest);
            return roomType;
        } catch (err) {
            throw err;
        }
    },

    getRoomType: async () => {
        try {
            const roomTypes = await RoomType.findAll();
            return roomTypes;
        } catch (err) {
            throw err;
        }
    },

    deleteRoomType: async (roomTypeId, adminId) => {
        const transaction = await sequelize.transaction();
        try{ 
            const admin = await Admin.findByPk(adminId, { transaction });
            if (!admin) throw UserError.AdminNotFound();

            const roomType = await RoomType.findByPk(roomTypeId, { 
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!roomType) throw RoomError.RoomTypeNotFound();

            const roomsCount = await Room.count({
                where: { roomTypeId },
                transaction,
            });

            if (roomsCount > 0) throw RoomError.CannotDeleteRoomType();

            await RoomType.destroy({
                where: { id: roomTypeId },
                transaction
            });

            await transaction.commit();
            return roomType;
        }
        catch(err){
            console.log(err);
            if (!transaction.finished) {
                await transaction.rollback();
            }
            throw err;
        }
    },

    updateRoomType: async (data, adminId, roomTypeId) => {
        const transaction = await sequelize.transaction();
        try{
            const { type, amenities } = data;

            const admin = await Admin.findByPk(adminId, { transaction });
            if (!admin) throw UserError.AdminNotFound();

            const roomType = await RoomType.findByPk(roomTypeId, { 
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!roomType) throw RoomError.RoomTypeNotFound();

            await roomType.update(
                { type, amenities },
                { transaction }
            );

            await transaction.commit();
            return roomType;

        }catch(err){
            console.log(err);
            if (!transaction.finished) {
                await transaction.rollback();
            }
            throw err;
        }
    },

    getRoomTypeForAdmin: async (getRoomTypeForAdminRequest) => {
        try {
            const building = await Building.findByPk(getRoomTypeForAdminRequest.buildingId, {
                include: [{
                    model: RoomType,
                    attributes: ["id", "type", "amenities"]
                }]
            });

            if (!building) {
                throw FloorError.BuildingNotFound();
            }

            return building.RoomTypes;
        } catch (err) {
            throw err;
        }
    },

    createRoom: async (createRoomRequest) => {
        try {
            const floor = await Floor.findByPk(createRoomRequest.floorId);
            if (!floor) {
                throw RoomError.FloorNotFound();
            }

            const roomType = await RoomType.findByPk(createRoomRequest.roomTypeId);
            if (!roomType) {
                throw RoomError.RoomTypeNotFound();
            }

            const existingRoom = await Room.findOne({
                where: {
                    floorId: createRoomRequest.floorId,
                    roomNumber: createRoomRequest.roomNumber
                }
            });

            if (existingRoom) {
                throw RoomError.RoomNumberExistsInFloor();
            }
            const room = await Room.create(createRoomRequest);
            for (i = 1; i <= room.capacity; i++) {
                await RoomSlot.create({
                    roomId: room.id,
                    slotNumber: i,
                    isOccupied: false
                });
            }
            return room;
        } catch (err) {
            throw err;
        }
    },

    updateRoom: async (roomUpdateRequest, adminId) => {
        const transaction = await sequelize.transaction();
        try {
            const {
                roomId,
                roomNumber,
                roomTypeId,
                capacity,
                price
            } = roomUpdateRequest;

            // Kiểm tra admin trước 
            const admin = await Admin.findByPk(adminId, {
                transaction
            });
            if (!admin) throw UserError.AdminNotFound();

            // Kiểm tra phòng định sửa có tồn tại không
            const existingRoom = await Room.findByPk(roomId, {
                include: [{
                    model: Floor,
                    include: [{
                        model: Building,
                        include: [{
                            model: RoomType
                        }]
                    }]
                }],
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!existingRoom) throw RoomError.InvalidUpdateRoom();

            // Kiểm tra roomType có tồn tại hay không
            if (roomTypeId){
                const newRoomType = await RoomType.findByPk(roomTypeId, {
                    transaction
                });
                if (!newRoomType) throw RoomError.RoomTypeNotFound();
                const buildingRoomTypes = existingRoom.Floor.Building.RoomTypes;
                const isValid = buildingRoomTypes.some(rt => rt.id === roomTypeId);
                if (!isValid) throw RoomError.InvalidRoomType();
            }

            // Kiểm tra phòng đang có sinh viên ở hay không, nếu có không cho chỉnh sửa
            const roomSlots = await RoomSlot.findAll({
                where: {
                    roomId: roomId
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            })

            // Nếu có slot đang bị chiếm thì không cho chỉnh nữa
            if (roomSlots.some(slot => Number(slot.isOccupied) === 1)) throw RoomError.RoomOccupied();

            // Đặt lại hết tất cả roomSlot thành bị chiếm để không cho ai đăng ký vào nữa
            await Promise.all(roomSlots.map(slot => slot.update({
                isOccupied: 1
            }, {
                transaction
            })));

            // Hủy tất các các đơn đang đăng ký vào phòng này, không cho các admin khác duyệt
            const registrationIds = await RoomRegistration.findAll({
                where: {
                    roomSlotId: roomSlots.map(s => s.id),
                    status: "BOOKED"
                },
                transaction,
            }).then(list => list.map(r => r.id));


            console.log("OMG", registrationIds);

            if (registrationIds?.length) {
                const response = await roomRegistrationService.rejectRoomRegistration(
                    new RejectRoomRegistrationRequest({
                        ids: registrationIds,
                        reason: "Hiện tại phòng đang được chỉnh sửa"
                     })
                );
                console.log("Data trả về khi xóa", response);
            }

            if (roomNumber) existingRoom.roomNumber = roomNumber;
            if (price) existingRoom.monthlyFee = price;
            if (roomTypeId) existingRoom.roomTypeId = roomTypeId;

            if (capacity && capacity !== roomSlots.length) {

                await RoomSlot.destroy({ where: { roomId }, transaction });
                existingRoom.capacity = capacity
                const newSlots = [];
                for (let i = 1; i <= capacity; i++) {
                    newSlots.push({ roomId, slotNumber: i, isOccupied: 0 });
                }
                await RoomSlot.bulkCreate(newSlots, { transaction });
            }
            else{
                // Trả lại trạng thái phòng bằng 0 như ban đầu
                await RoomSlot.update(
                    { isOccupied: 0 },
                    { where: { roomId }, transaction }
                );
            }

            // Lưu Room lại
            const response = await existingRoom.save({ transaction });
            await transaction.commit();
            return response;

        } catch (err) {
            console.log(err);
            await transaction.rollback();
            throw err;
        }
    },


    deleteRoom: async( roomId, adminId ) => {
        const transaction = await sequelize.transaction();
        try {
            // Kiểm tra admin trước 
            const admin = await Admin.findByPk(adminId, {
                transaction
            });
            if (!admin) throw UserError.AdminNotFound();

            // Kiểm tra phòng định sửa có tồn tại không
            const existingRoom = await Room.findByPk(roomId, {
                include: [{
                    model: Floor,
                },
                {
                    model: RoomType
                }],
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!existingRoom) throw RoomError.InvalidDeleteRoom();

            const roomSlots = await RoomSlot.findAll({
                where: {
                    roomId: roomId
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            })

            if (roomSlots.some(slot => Number(slot.isOccupied) === 1)) throw RoomError.RoomOccupied();

            await Promise.all(roomSlots.map(slot => slot.update({
                isOccupied: 1
            }, {
                transaction
            }))); 

            const registrationIds = await RoomRegistration.findAll({
                where: {
                    roomSlotId: roomSlots.map(s => s.id),
                    status: "BOOKED"
                },
                transaction,
            }).then(list => list.map(r => r.id));

            if (registrationIds?.length) {
                const response = await roomRegistrationService.rejectRoomRegistration(
                    new RejectRoomRegistrationRequest({
                        ids: registrationIds,
                        reason: "Hiện tại phòng đang không còn hoạt động"
                     })
                );
                console.log("Data trả về khi xóa", response);
            }

        
            await existingRoom.destroy({transaction});
            await transaction.commit();
            return existingRoom;
        }
        catch(err){
            console.log(err);
            await transaction.rollback();
            throw err;
        }
    },

    getRoom: async (getRoomRequest) => {
        try {
            const floors = await floorServices.getFloor(getRoomRequest);
            const floorIds = floors.map(floor => floor.id);
            const rooms = await Room.findAll({
                include: [{
                        model: RoomType,
                        where: {
                            id: getRoomRequest.roomTypeId
                        },
                        attributes: ['type', 'amenities']
                    },
                    {
                        model: Floor,
                        attributes: ['number', ]
                    },
                    {
                        model: RoomSlot,
                        attributes: ["id", 'slotNumber', 'isOccupied']
                    }
                ],
                where: {
                    floorId: floorIds,
                    roomTypeId: getRoomRequest.roomTypeId
                },
                order: [
                    ['roomNumber', 'ASC'],
                    [RoomSlot, 'slotNumber', 'ASC']
                ]
            });
            const availableRooms = rooms.filter(room =>
                room.RoomSlots.some(slot => !slot.isOccupied)
            );

            return availableRooms;
        } catch (err) {
            throw err;
        }
    },

    getRoomByUser: async (roleId) => {
        try {
            const roomRegistration = await RoomRegistration.findOne({
                where: {
                    studentId: roleId,
                    status: ["CONFIRMED", "MOVE_PENDING", "EXTENDING", "CANCELED"],
                    endDate: {
                        [Op.gt]: new Date()
                    }
                },
                include: [{
                    model: Student,
                    attributes: ["userId"],
                    include: [{
                        model: User,
                        attributes: ['name', 'identification']
                    }]
                }],
                order: [
                    ["createdAt", "DESC"]
                ]
            });
            if (!roomRegistration) {
                throw RoomRegistrationError.RoomRegistrationNotFound();
            }
            const roomSlot = await RoomSlot.findByPk(roomRegistration.roomSlotId)
            const room = await Room.findByPk(roomSlot.roomId, {
                include: [{
                        model: RoomSlot,
                        attributes: ['slotNumber', 'isOccupied'],
                    },
                    {
                        model: RoomType,
                        attributes: ['type', 'amenities']
                    }
                ]
            });
            return {
                ...roomRegistration.toJSON(),
                ...roomSlot.toJSON(),
                ...room.toJSON()
            };
        } catch (err) {
            throw err;
        }
    },

    getRoomHistoryByUser: async (roleId) => {
        try {
            const roomRegistrations = await RoomRegistration.findAll({
                where: {
                    studentId: roleId,
                    status: {
                        [Op.in]: ["CANCELED", "MOVED", "EXTENDED"]
                    },
                    endDate: {
                        [Op.lte]: new Date()
                    }
                },
                include: [{
                        model: Student,
                        attributes: ["userId"],
                        include: [{
                            model: User,
                            attributes: ["name", "identification"]
                        }]
                    },
                    {
                        model: RoomSlot,
                        attributes: ["slotNumber", "isOccupied"],
                        include: [{
                            model: Room,
                            attributes: ["roomNumber", "capacity", "monthlyFee"],
                            include: [{
                                model: RoomType,
                                attributes: ["type", "amenities"]
                            }]
                        }]
                    }
                ],
                order: [
                    ["endDate", "DESC"],
                    [RoomSlot, "slotNumber", "ASC"]
                ]
            });

            if (!roomRegistrations || roomRegistrations.length === 0) {
                throw RoomRegistrationError.RoomRegistrationNotFound();
            }
            return roomRegistrations;

        } catch (err) {
            throw err;
        }
    },

    getRoomForAdmin: async (getRoomForAdminRequest) => {
        try {
            const {
                page,
                limit,
                floorId,
                buildingId,
                floorNumber,
                status
            } = getRoomForAdminRequest;
            const offset = (page - 1) * limit;
            const floorCondition = (floorId && floorId !== "All") ? {
                floorId
            } : {};
            
            // Build Floor include condition - only add where clause if we have valid filter conditions
            const floorInclude = {
                model: Floor,
                attributes: ["number"]
            };
            
            const hasBuildingFilter = buildingId && buildingId !== "All";
            const hasFloorNumberFilter = floorNumber !== null && floorNumber !== undefined;
            
            if (hasBuildingFilter || hasFloorNumberFilter) {
                floorInclude.where = {};
                if (hasBuildingFilter) {
                    floorInclude.where.buildingId = buildingId;
                }
                if (hasFloorNumberFilter) {
                    floorInclude.where.number = floorNumber;
                }
            }
            
            const rooms = await Room.findAll({
                where: {
                    ...floorCondition,
                },
                include: [{
                        model: RoomType,
                        attributes: ['type', 'amenities']
                    },
                    {
                        model: RoomSlot,
                        attributes: ["id", "slotNumber", "isOccupied"]
                    },
                    floorInclude
                ],
                order: [
                    ['roomNumber', 'ASC'],
                    [RoomSlot, 'slotNumber', 'ASC']
                ]
            });

            let filteredRooms = rooms;

            if (status === "Available") {
                filteredRooms = rooms.filter(room =>
                    room.RoomSlots && room.RoomSlots.length > 0 && room.RoomSlots.some(slot => slot.isOccupied === false)
                );
            } else if (status === "Full") {
                filteredRooms = rooms.filter(room =>
                    room.RoomSlots && room.RoomSlots.length > 0 && room.RoomSlots.every(slot => slot.isOccupied === true)
                );
            }

            const totalItems = filteredRooms.length;
            const pagedRooms = filteredRooms.slice(offset, offset + limit);
            return {
                totalItems,
                response: pagedRooms
            };

        } catch (err) {
            throw err;
        }
    },
};
module.exports = roomServices;