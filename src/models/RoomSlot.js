'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class RoomSlot extends Model {
        static associate(models) {
            RoomSlot.belongsTo(models.Room, { foreignKey: 'roomId' });
            RoomSlot.hasMany(models.RoomRegistration, { foreignKey: 'roomSlotId' });
        }
    }

    RoomSlot.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        slotNumber: DataTypes.INTEGER,
        isOccupied: DataTypes.BOOLEAN,
    }, {
        sequelize,
        modelName: 'RoomSlot',
        tableName: 'RoomSlots',
    });

    return RoomSlot;
};
