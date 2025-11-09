'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MeterReading extends Model {
    static associate(models) {
      MeterReading.belongsTo(models.Room, { foreignKey: 'roomId' });
      MeterReading.belongsTo(models.Admin, { foreignKey: 'adminId' });
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
    period: {
      type: DataTypes.CHAR(7), // "2025-11"
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
