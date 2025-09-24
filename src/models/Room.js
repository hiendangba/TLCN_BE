'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      // 1 Room thuộc về 1 Floor
      Room.belongsTo(models.Floor, { foreignKey: 'floorId' });

      // 1 Room có nhiều MeterReading
      Room.hasMany(models.MeterReading, { foreignKey: 'roomId' });

      // 1 Room có nhiều User
      Room.hasMany(models.User, { foreignKey: 'roomId' });
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
      unique: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true // danh sách tiện nghi, có thể null
    },
    monthlyFee: {
      type: DataTypes.DECIMAL,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Room',
    tableName: 'Rooms'
  });

  return Room;
};
