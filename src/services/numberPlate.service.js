const { NumberPlate, Student, User } = require("../models");
const cloudinary = require("../config/cloudinary");
const NumberPlateError = require("../errors/NumberPlateError");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

const numberPlateServices = {
    createNumberPlate: async (createNumberPlateRequest, filename) => {
        try {
            const existsNumber = await NumberPlate.findOne({
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

    getNumberPlate: async (getNumberPlateRequest) => {
        try {
            const { page, limit, keyword, status } = getNumberPlateRequest;
            const offset = (page - 1) * limit;
            const searchCondition = keyword
                ? {
                    [Op.or]: [
                        { "$Student.User.name$": { [Op.like]: `%${keyword}%` } },
                        { "$Student.User.identification$": { [Op.like]: `%${keyword}%` } },
                        { "$number$": { [Op.like]: `%${keyword}%` } },
                    ],
                }
                : {};

            const numberPlate = await NumberPlate.findAndCountAll({
                where: {
                    ...searchCondition,
                    status,
                },
                include: [
                    {
                        model: Student,
                        attributes: ["id", "mssv", "school", "userId"],
                        include: [
                            {
                                model: User,
                                attributes: ["id", "name", "identification", "dob", "gender", "address",],
                            },
                        ],
                    }
                ],
                offset,
                limit,
                order: [["createdAt", "DESC"]],
            });

            return { totalItems: numberPlate.count, response: numberPlate.rows };
        } catch (err) {
            throw err;
        }
    },

    approvedNumberPlate: async (approvedNumberPlateRequest) => {
        try {
            const [updatedCount] = await NumberPlate.update(
                { status: "approved", adminId: approvedNumberPlateRequest.adminId },
                {
                    where: { id: approvedNumberPlateRequest.ids },
                }
            );

            //sau đó gọi modal đọc hình ảnh ở đây
            return updatedCount
        } catch (err) {
            throw err;
        }
    },

    rejectNumberPlate: async (rejectNumberPlateRequest) => {
        try {
            const [updatedCount] = await NumberPlate.update(
                { status: "rejected" },
                {
                    where: { id: rejectNumberPlateRequest.ids },
                }
            );
            return updatedCount
        } catch (err) {
            throw err;
        }
    },
};
module.exports = numberPlateServices;