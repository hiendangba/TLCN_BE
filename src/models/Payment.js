'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      // Một Payment thuộc về một User
      Payment.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  Payment.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'VND'
    },
    qrContent: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transactionRef: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'Payments'
  });

  return Payment;
};
