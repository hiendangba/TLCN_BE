const BuildingError = require("../errors/BuildingError");
const { Building, RoomType } = require("../models");
const FloorError = require("../errors/FloorError");

const buildingServices = {
    createBuilding: async (createBuildingRequest) => {
        try {
            const existsName = await Building.findOne({
                where: { name: createBuildingRequest.name }
            });

            if (existsName) {
                throw BuildingError.NameExists();
            }

            const building = await Building.create(createBuildingRequest);

            const roomTypes = await RoomType.findAll({
                where: { id: createBuildingRequest.roomTypeIds }
            });

            await building.addRoomTypes(roomTypes);

            return building;
        } catch (err) {
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

    getBuilding: async (getBuildingRequest) => {
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
};
module.exports = buildingServices;