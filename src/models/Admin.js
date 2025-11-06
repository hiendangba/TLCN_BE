'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Admin extends Model {
        static associate(models) {
            // Mỗi Admin thuộc về một User
            Admin.belongsTo(models.User, { foreignKey: 'userId' });

            // Một Admin có thể quản lý nhiều thứ khác
            Admin.hasMany(models.RoomRegistration, { foreignKey: 'adminId' });
            Admin.hasMany(models.HealthCheck, { foreignKey: 'adminId' });
            Admin.hasMany(models.MeterReading, { foreignKey: 'adminId' });
        }
    }

    Admin.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true,
            },
        },
        {
            sequelize,
            modelName: 'Admin',
            tableName: 'Admins',
            timestamps: true,
        }
    );

    return Admin;
};
