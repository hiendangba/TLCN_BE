const { Room, RoomType, Floor, RoomSlot } = require("../models");
const floorServices = require("./floor.service");
const RoomError = require("../errors/RoomError");
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
                await RoomSlot.create({ roomId: room.id, slotNumber: i, isOccupied: false });
            }
            return room;
        } catch (err) {
            throw err;
        }
    },

    getRoom: async (getRoomRequest) => {
        try {
            const floors = await floorServices.getFloor(getRoomRequest);
            const floorIds = floors.map(floor => floor.id);
            const rooms = await Room.findAll({
                include: [
                    {
                        model: RoomType,
                        where: { id: getRoomRequest.roomTypeId },
                        attributes: ['type', 'amenities'] // chọn cột cần lấy
                    },
                    {
                        model: Floor,
                        attributes: ['number',] // thông tin tầng
                    },
                    {
                        model: RoomSlot,
                        attributes: ['slotNumber', 'isOccupied'] // thông tin slot phòng
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

            // Lọc các phòng có ít nhất một slot trống
            const availableRooms = rooms.filter(room =>
                room.RoomSlots.some(slot => !slot.isOccupied)
            );
            
            return availableRooms;
        } catch (err) {
            throw err;
        }
    },
};
module.exports = roomServices;