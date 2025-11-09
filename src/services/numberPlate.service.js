const { NumberPlate } = require("../models");
const cloudinary = require("../config/cloudinary");
const NumberPlateError = require("../errors/NumberPlateError");
const numberPlateServices = {

    createNumberPlate: async (createNumberPlateRequest, filename) => {
        try {
            const existsNumber = NumberPlate.findOne({
                where: { number: createNumberPlateRequest.number }
            })

            if (existsNumber) {
                await cloudinary.uploader.destroy(filename);
                throw NumberPlateError.NameExists();
            }

            const numberPlate = NumberPlate.create(createNumberPlateRequest);
            return numberPlate;
        } catch (err) {
            throw err;
        }
    },

};
module.exports = numberPlateServices;