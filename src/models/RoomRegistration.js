'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class RoomRegistration extends Model {
        static associate(models) {
            RoomRegistration.belongsTo(models.Student, { foreignKey: 'studentId' });
            RoomRegistration.belongsTo(models.RoomSlot, { foreignKey: 'roomSlotId' });
            RoomRegistration.belongsTo(models.Admin, { foreignKey: 'adminId' });
        }
    }

    RoomRegistration.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        registerDate: DataTypes.DATE,
        approvedDate: DataTypes.DATE,
        endDate: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'RoomRegistration',
        tableName: 'RoomRegistrations',
    });

    return RoomRegistration;
};
