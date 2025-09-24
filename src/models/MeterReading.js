'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MeterReading extends Model {
    static associate(models) {
      // Mỗi chỉ số điện/nước thuộc về 1 phòng
      MeterReading.belongsTo(models.Room, { foreignKey: 'roomId' });
    }
  }

  MeterReading.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    type: {
      type: DataTypes.STRING,  // "electricity" hoặc "water"
      allowNull: false
    },
    oldValue: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    newValue: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    unitPrice: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    readingDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'MeterReading',
    tableName: 'MeterReadings'
  });

  return MeterReading;
};
