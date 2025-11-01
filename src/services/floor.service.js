const FloorError = require("../errors/FloorError");
const { Floor, Building } = require("../models");

const floorServices = {
    createFloor: async (createFloorRequest) => {
        try {
            const building = await Building.findByPk(createFloorRequest.buildingId);
            if (!building) {
                throw FloorError.BuildingNotFound();
            }
            const existingFloor = await Floor.findOne({
                where: {
                    buildingId: createFloorRequest.buildingId,
                    number: createFloorRequest.number
                }
            });

            if (existingFloor) {
                throw FloorError.FloorAlreadyExists();
            }
            const maxFloor = await Floor.findOne({
                where: { buildingId: createFloorRequest.buildingId },
                order: [['number', 'DESC']],
            });

            if (!maxFloor && createFloorRequest.number !== 1) {
                throw FloorError.FirstFloorMustBeOne();
            }

            if (maxFloor && createFloorRequest.number !== maxFloor.number + 1) {
                throw FloorError.InvalidFloorOrder(maxFloor.number + 1);
            }
            const floor = await Floor.create(createFloorRequest);
            return floor;

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