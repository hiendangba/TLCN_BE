const { createBuilding } = require("../controllers/building.controller");
const BuildingError = require("../errors/BuildingError");
const { Building } = require("../models");

const buildingServices = {
    createBuilding: async (createBuildingRequest) => {
        try {
            const existsName = await Building.findOne({
                where: { name: createBuildingRequest.name }
            });
            if(existsName){
                throw BuildingError.NameExists();
            }
            const building = await Building.create(createBuildingRequest);
            return building;
        } catch (err) {
            throw err;
        }
    },
};
module.exports = buildingServices;