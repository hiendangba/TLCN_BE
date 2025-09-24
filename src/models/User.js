'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Room, { foreignKey: 'roomId' });
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    identification: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // số CMND/CCCD phải duy nhất
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mssv: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // mã số sinh viên duy nhất
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: false
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false
    },
    school: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // số điện thoại duy nhất
    },
    gmail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // email phải duy nhất
      validate: {
        isEmail: true
      }
    },
    nation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    apostate: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
  });
  return User;
};
