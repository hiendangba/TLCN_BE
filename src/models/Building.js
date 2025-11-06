'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Building extends Model {
    static associate(models) {
      Building.belongsToMany(models.RoomType, {
        through: 'BuildingRoomTypes', 
        foreignKey: 'buildingId',
        otherKey: 'roomTypeId'
      }); 
      Building.hasMany(models.Floor, { foreignKey: 'buildingId' });
      Building.hasMany(models.HealthCheck, { foreignKey: 'buildingId'});
    }
  }

  Building.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    genderRestriction: {
      type: DataTypes.STRING,
      allowNull: false // ví dụ: chỉ nam, chỉ nữ, hoặc null nếu không giới hạn
    }
  }, {
    sequelize,
    modelName: 'Building',
    tableName: 'Buildings'
  });

  return Building;
};
