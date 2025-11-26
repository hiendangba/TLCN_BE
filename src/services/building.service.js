const BuildingError = require("../errors/BuildingError");
const { Building, RoomType, Floor, Room, RoomSlot } = require("../models");
const FloorError = require("../errors/FloorError");
const { CreateFloorRequest } = require("../dto/request/floor.request")
const floorServices = require("./floor.service")
const { sequelize } = require("../config/database");

const buildingServices = {
    createBuilding: async (createBuildingRequest) => {
        const transaction = await sequelize.transaction();
        try {
            const existsName = await Building.findOne({
                where: { name: createBuildingRequest.name }
            });

            if (existsName) {
                throw BuildingError.NameExists();
            }

            const building = await Building.create(createBuildingRequest, { transaction });

            const roomTypes = await RoomType.findAll({
                where: { id: createBuildingRequest.roomTypeIds }
            });

            if (roomTypes.length !== createBuildingRequest.roomTypeIds.length) {
                throw BuildingError.RoomTypeNotFound();
            }

            await building.addRoomTypes(roomTypes, { transaction });
            const createFloorRequest = new CreateFloorRequest(createBuildingRequest.numberFloor, building.id)
            await floorServices.createFloor(createFloorRequest, transaction)
            await transaction.commit();
            return building;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    deleteBuilding: async (deleteBuildingRequest) => {
        try {
            const building = await Building.findByPk(deleteBuildingRequest.id, {
                include: [{
                    model: Floor,
                    include: [{ model: Room, include: [RoomSlot] }]
                }],
            });
            if (!building) {
                throw FloorError.BuildingNotFound()
            }

            let hasOccupiedSlot = false;

            for (const floor of building.Floors) {
                for (const room of floor.Rooms) {
                    for (const slot of room.RoomSlots) {
                        if (slot.isOccupied === true) {
                            hasOccupiedSlot = true;
                            break;
                        }
                    }
                    if (hasOccupiedSlot) break;
                }
                if (hasOccupiedSlot) break;
            }

            if (hasOccupiedSlot) {
                throw BuildingError.BuildingHasOccupiedSlots();
            }

            building.destroy();
            return { message: "Xóa tòa nhà thành công." };
        } catch (err) {
            throw err;
        }
    },

    getBuildingByGenderRestriction: async (getBuildingRequest) => {
        try {
            const buildings = await Building.findAll({
                include: [
                    {
                        model: RoomType,
                        where: { id: getBuildingRequest.roomTypeId },
                    }
                ],
                where: {
                    genderRestriction: getBuildingRequest.genderRestriction
                },
                order: [['name', 'ASC']]
            });
            return buildings;
        } catch (err) {
            throw err;
        }
    },

    getBuilding: async () => {
        try {
            // 1. Lấy tất cả building + số tầng
            const buildings = await Building.findAll({
                attributes: {
                    include: [
                        [sequelize.fn("COUNT", sequelize.col("Floors.id")), "numberFloor"]
                    ]
                },
                include: [{ model: Floor, attributes: [] }],
                group: ['Building.id'],
                order: [['name', 'ASC']],
                raw: false
            });

            // 2. Lấy RoomTypes cho từng building
            for (const b of buildings) {
                const roomTypes = await b.getRoomTypes({ attributes: ['id', 'type', 'amenities'] });
                b.dataValues.roomTypes = roomTypes;
            }

            return buildings;
        } catch (err) {
            throw err;
        }
    },

    updateBuilding: async (updateBuildingRequest) => {
        try {
            const building = await Building.findByPk(updateBuildingRequest.id, {
                include: [{
                    model: Floor,
                    include: [{ model: Room }]
                }],
            });

            if (!building) {
                throw BuildingError.NotFound();
            }
            let hasRoom = false;

            for (const floor of building.Floors) {
                if (floor.Rooms.length > 0) {
                    hasRoom = true;
                    break;
                }
            }

            if (hasRoom) {
                throw BuildingError.BuildingHasRooms();
            }

            await building.update(updateBuildingRequest);
            if (updateBuildingRequest.numberFloor && updateBuildingRequest.numberFloor !== building.Floors.length) {
                const currentFloorCount = building.Floors.length;
                const newFloorCount = updateBuildingRequest.numberFloor;

                if (newFloorCount > currentFloorCount) {
                    const floorsToAdd = newFloorCount - currentFloorCount;
                    for (let i = 0; i < floorsToAdd; i++) {
                        await Floor.create({
                            buildingId: building.id,
                            number: currentFloorCount + i + 1
                        });
                    }
                } else {
                    const floorsToDelete = building.Floors
                        .filter(floor => floor.number > newFloorCount);

                    // vì bạn đã check hasRoom = false nên chắc chắn không có Room
                    for (const floor of floorsToDelete) {
                        await floor.destroy();
                    }
                }
            }
            if (updateBuildingRequest.roomTypeIds) {
                const roomTypes = await RoomType.findAll({
                    where: { id: updateBuildingRequest.roomTypeIds }
                });
                if (roomTypes.length !== updateBuildingRequest.roomTypeIds.length) {
                    throw BuildingError.RoomTypeNotFound();
                }
                await building.setRoomTypes(roomTypes);
            }
            return { message: "Sửa tòa nhà thành công." };
        } catch (err) {
            throw err;
        }
    }
};
module.exports = buildingServices;