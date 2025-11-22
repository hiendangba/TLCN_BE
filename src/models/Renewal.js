'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Renewal extends Model {
        static associate(models) {
            Renewal.belongsTo(models.Admin, { as: 'startedByAdmin', foreignKey: 'startedBy' });
            Renewal.belongsTo(models.Admin, { as: 'stoppedByAdmin', foreignKey: 'stoppedBy' });
        }
    }

    Renewal.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        isActive: DataTypes.BOOLEAN,
    }, {
        sequelize,
        modelName: 'Renewal',
        tableName: 'Renewals'
    });

    return Renewal;
};
