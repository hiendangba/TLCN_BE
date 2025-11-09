'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      Room.belongsTo(models.Floor, { foreignKey: 'floorId' });
      Room.belongsTo(models.RoomType, { foreignKey: 'roomTypeId' });
      Room.hasMany(models.RoomSlot, { foreignKey: 'roomId' });
      Room.hasMany(models.MeterReading, { foreignKey: 'roomId' });
    }
  }

  Room.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    roomNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capicity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    monthlyFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Room',
    tableName: 'Rooms'
  });

  return Room;
};
