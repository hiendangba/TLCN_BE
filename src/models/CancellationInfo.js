'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CancellationInfo extends Model {
        static associate(models) {
            CancellationInfo.belongsTo(models.RoomRegistration, { foreignKey: "roomRegistrationId" });
        }
    }

    CancellationInfo.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true
        },
        checkoutDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        refundStatus: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
            defaultValue: 'PENDING',
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'CancellationInfo',
        tableName: 'CancellationInfos'
    });
    return CancellationInfo;
};
