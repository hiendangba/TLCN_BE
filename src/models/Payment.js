'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Student, { foreignKey: 'studentId' });
    }
  }

  Payment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 0),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'VND',
    },
    qrContent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transactionRef: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed'),
      defaultValue: 'pending',
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'Payments'
  });

  return Payment;
};
