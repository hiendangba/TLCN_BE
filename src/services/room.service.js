const { Room, RoomRegistration, RoomSlot, RoomType, Floor, Building, Student, User } = require("../models");
const floorServices = require("./floor.service");
const RoomError = require("../errors/RoomError");
const RoomRegistrationError = require("../errors/RoomRegistrationError")
const FloorError = require("../errors/FloorError");
const { Op } = require("sequelize");

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

    getRoomTypeForAdmin: async (getRoomTypeForAdminRequest) => {
        try {
            const building = await Building.findByPk(getRoomTypeForAdminRequest.buildingId, {
                include: [
                    {
                        model: RoomType,
                        attributes: ["id", "type", "amenities"]
                    }
                ]
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
                        attributes: ['type', 'amenities']
                    },
                    {
                        model: Floor,
                        attributes: ['number',]
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
            // Lọc các phòng có ít nhất một slot trống
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
                    status: "CONFIRMED",
                    endDate: {
                        [Op.gt]: new Date()
                    }
                },
                include: [
                    {
                        model: Student,
                        attributes: ["userId"],
                        include: [
                            {
                                model: User,
                                attributes: ['name', 'identification']
                            }
                        ]
                    }
                ]
            });
            if (!roomRegistration) {
                throw RoomRegistrationError.RoomRegistrationNotFound();
            }
            const roomSlot = await RoomSlot.findByPk(roomRegistration.roomSlotId)
            const room = await Room.findByPk(roomSlot.roomId, {
                include: [
                    {
                        model: RoomSlot,
                        attributes: ['slotNumber', 'isOccupied'],
                    },
                    {
                        model: RoomType,
                        attributes: ['type', 'amenities']
                    }
                ],
                order: [
                    [RoomSlot, 'slotNumber', 'ASC']
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
            console.log(roleId)
            const roomRegistrations = await RoomRegistration.findAll({
                where: {
                    studentId: roleId,
                    status: { [Op.in]: ["CANCELED", "MOVED"] },
                    endDate: { [Op.lte]: new Date() }
                },
                include: [
                    {
                        model: Student,
                        attributes: ["userId"],
                        include: [
                            {
                                model: User,
                                attributes: ["name", "identification"]
                            }
                        ]
                    },
                    {
                        model: RoomSlot,
                        attributes: ["slotNumber", "isOccupied"],
                        include: [
                            {
                                model: Room,
                                attributes: ["roomNumber", "capacity", "monthlyFee"],
                                include: [
                                    {
                                        model: RoomType,
                                        attributes: ["type", "amenities"]
                                    }
                                ]
                            }
                        ]
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
            const { page, limit, floorId, status } = getRoomForAdminRequest;
            const offset = (page - 1) * limit;
            const floorCondition = floorId === "All" ? {} : { floorId };
            const rooms = await Room.findAll({
                where: {
                    ...floorCondition,
                },
                include: [
                    {
                        model: RoomType,
                        attributes: ['type', 'amenities']
                    },
                    {
                        model: RoomSlot,
                        attributes: ["id", "slotNumber", "isOccupied"]
                    },
                    {
                        model: Floor,
                        attributes: ["number"]
                    }
                ],
                order: [
                    ['roomNumber', 'ASC'],
                    [RoomSlot, 'slotNumber', 'ASC']
                ]
            });

            let filteredRooms = rooms;

            if (status === "Available") {
                filteredRooms = rooms.filter(room =>
                    room.RoomSlots.some(slot => slot.isOccupied === false)
                );
            }

            else if (status === "Full") {
                filteredRooms = rooms.filter(room =>
                    room.RoomSlots.every(slot => slot.isOccupied === true)
                );
            }

            // Case "All" => Không lọc gì -> giữ nguyên filteredRooms = rooms
            const totalItems = filteredRooms.length;
            const pagedRooms = filteredRooms.slice(offset, offset + limit);
            return { totalItems, response: pagedRooms };

        } catch (err) {
            throw err;
        }
    },
};
module.exports = roomServices;