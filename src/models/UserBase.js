'use strict';
const { Model } = require('sequelize');

class UserBase extends Model { }

const defineUserBaseFields = (DataTypes) => ({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  identification: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dob: DataTypes.DATE,
  gender: DataTypes.STRING,
  phone: {
    type: DataTypes.STRING,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    validate: { isEmail: true }
  },
  nation: DataTypes.STRING,
  apostate: DataTypes.STRING
});

module.exports = { UserBase, defineUserBaseFields };
