'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NumberPlate extends Model {
    static associate(models) {
      NumberPlate.belongsTo(models.Student, {foreignKey: 'studentId',});
    }
  }

  NumberPlate.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registerDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
  }, {
    sequelize,
    modelName: 'NumberPlate',
    tableName: 'NumberPlates',
    timestamps: true
  });

  return NumberPlate;
};
