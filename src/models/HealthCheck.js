'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class HealthCheck extends Model {
        static associate(models) {
            HealthCheck.belongsTo(models.Admin, {
                foreignKey: 'adminId'
            });
            HealthCheck.hasMany(models.RegisterHealthCheck, {
                foreignKey: 'healthCheckId'
            });
            HealthCheck.belongsTo(models.Building, {
                foreignKey: 'buildingId'
            })
        }
    }
    HealthCheck.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 100
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
    }, {
        sequelize,
        modelName: 'HealthCheck',
        tableName: 'HealthChecks',
        timestamps: true
    });
    return HealthCheck;
};