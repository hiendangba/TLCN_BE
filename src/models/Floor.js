'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Floor extends Model {
    static associate(models) {
      // Một tầng thuộc về 1 toà nhà
      Floor.belongsTo(models.Building, { foreignKey: 'buildingId' });

      // Một tầng có nhiều phòng
      Floor.hasMany(models.Room, { foreignKey: 'floorId' });
    }
  }

  Floor.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Floor',
    tableName: 'Floors'
  });

  return Floor;
};
