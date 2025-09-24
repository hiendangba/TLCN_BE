'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Building extends Model {
    static associate(models) {
      // Một toà nhà có nhiều tầng
      Building.hasMany(models.Floor, { foreignKey: 'buildingId' });
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
      allowNull: true // ví dụ: chỉ nam, chỉ nữ, hoặc null nếu không giới hạn
    }
  }, {
    sequelize,
    modelName: 'Building',
    tableName: 'Buildings'
  });

  return Building;
};
