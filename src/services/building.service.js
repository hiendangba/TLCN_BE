const BuildingError = require("../errors/BuildingError");
const { Building, RoomType } = require("../models");
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
            const building = await Building.findByPk(deleteBuildingRequest.id);
            if (!building) {
                throw FloorError.BuildingNotFound()
            }
            const result = await Building.destroy({ where: { id: deleteBuildingRequest.id } });
            return result
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
            const buildings = await Building.findAll({
                order: [['name', 'ASC']]
            });
            return buildings;
        } catch (err) {
            throw err;
        }
    },
};
module.exports = buildingServices;