const { Floor, Building } = require("../models");
const FloorError = require("../errors/FloorError");
const RoomError = require("../errors/RoomError")
const floorServices = {
    createFloor: async (createFloorRequest, transaction) => {
        try {
            const floors = [];

            for (let i = 1; i <= createFloorRequest.numberFloor; i++) {
                floors.push({
                    buildingId: createFloorRequest.buildingId,
                    number: i
                });
            }

            await Floor.bulkCreate(floors, { transaction });
        } catch (err) {
            throw err;
        }
    },

    getFloor: async (getFloorRequest) => {
        try {
            const building = await Building.findByPk(getFloorRequest.buildingId);

            if (!building) {
                throw FloorError.BuildingNotFound();
            }

            const floors = await Floor.findAll({
                where: { buildingId: getFloorRequest.buildingId },
                order: [["number", "ASC"]],
            });

            return floors;
        } catch (err) {
            throw err;
        }
    },
};
module.exports = floorServices;