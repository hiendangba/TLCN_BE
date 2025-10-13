'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class RegisterHealthCheck extends Model {
        static associate(models) {
            RegisterHealthCheck.belongsTo(models.Student, { foreignKey: 'studentId' });
            RegisterHealthCheck.belongsTo(models.HealthCheck, { foreignKey: 'healthCheckId' });
        }
    }
    RegisterHealthCheck.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        registerDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'RegisterHealthCheck',
        tableName: 'RegisterHealthChecks',
        timestamps: true
    });

    return RegisterHealthCheck;
};
