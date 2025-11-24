'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class RoomRegistration extends Model {
        static associate(models) {
            RoomRegistration.belongsTo(models.Student, { foreignKey: 'studentId' });
            RoomRegistration.belongsTo(models.RoomSlot, { foreignKey: 'roomSlotId' });
            RoomRegistration.belongsTo(models.Admin, { foreignKey: 'adminId' });
            RoomRegistration.hasOne(models.CancellationInfo, { foreignKey: "roomRegistrationId" });
            RoomRegistration.belongsTo(models.RoomRegistration, { foreignKey: 'previousRegistrationId' });
        }
    }

    RoomRegistration.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        registerDate: DataTypes.DATEONLY,
        approvedDate: DataTypes.DATEONLY,
        endDate: DataTypes.DATEONLY,
        duration: DataTypes.STRING,
        status: {
            type: DataTypes.ENUM('BOOKED', 'CONFIRMED', 'CANCELED', 'MOVE_PENDING', 'PENDING', 'MOVED', 'EXTENDING', "PENDING_EXTENDED", 'EXTENDED'),
            defaultValue: 'BOOKED',
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'RoomRegistration',
        tableName: 'RoomRegistrations',
    });

    return RoomRegistration;
};
