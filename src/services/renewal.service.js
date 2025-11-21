const { Renewal, Admin, User } = require("../models");
const RenewalError = require("../errors/Renewal.Error")
const { Op } = require("sequelize");
const renewalServices = {
    createRenewal: async (adminId) => {
        try {
            const existsRenewal = await Renewal.findOne({
                where: { isActive: true }
            });
            if (existsRenewal) {
                throw RenewalError.AlreadyActive();
            }

            const renewal = await Renewal.create({
                isActive: true,
                startedBy: adminId
            })
            return renewal;
        } catch (err) {
            throw err;
        }
    },

    stopRenewal: async (adminId) => {
        try {
            const renewal = await Renewal.findOne({
                where: { isActive: true }
            });
            if (!renewal) {
                throw RenewalError.NotFoundActive();
            }
            const updatedRenewal = await renewal.update({
                isActive: false,
                stoppedBy: adminId,

            });
            return updatedRenewal;
        } catch (err) {
            throw err;
        }
    },

    getActive: async () => {
        try {
            const renewal = await Renewal.findOne({
                where: { isActive: true }
            });

            if (!renewal) {
                throw RenewalError.NotFoundActive();
            }

            return renewal;
        } catch (err) {
            throw err;
        }
    },

    getHistory: async (getHistoryRenewalRequest) => {
        try {
            const { page, limit, keyword, status } = getHistoryRenewalRequest;
            const offset = (page - 1) * limit;


            const searchCondition = keyword
                ? {
                    [Op.or]: [
                        { "$startedByAdmin.name$": { [Op.like]: `%${keyword}%` } },
                        { "$stoppedByAdmin.name$": { [Op.like]: `%${keyword}%` } },

                    ],
                }
                : {};

            let statusCondition = {};
            switch (status) {
                case "Active":
                    statusCondition = { isActive: true };
                    break;
                case "Inactive":
                    statusCondition = { isActive: false };
                case "All":
                default:
                    statusCondition = {};
                    break;
            }
            const renewal = await Renewal.findAndCountAll({
                where: {
                    ...statusCondition,
                    ...searchCondition,
                },
                include: [
                    { model: Admin, as: 'startedByAdmin', include: [{ model: User, attributes: ['name'] }] },
                    { model: Admin, as: 'stoppedByAdmin', include: [{ model: User, attributes: ['name'] }] }
                ],
                offset,
                limit,
                order: [
                    ["createdAt", "ASC"]
                ],
            });

            return {
                totalItems: renewal.count,
                response: renewal.rows,
            };

        } catch (err) {
            throw err;
        }
    },
};
module.exports = renewalServices;