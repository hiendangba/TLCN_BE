const BuildingError = require("../errors/BuildingError");
const { Building, RoomType } = require("../models");

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