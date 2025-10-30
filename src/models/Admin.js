'use strict';
const { UserBase, defineUserBaseFields } = require('./base/UserBase');

module.exports = (sequelize, DataTypes) => {
    class Admin extends UserBase {
        static associate(models) {
            Admin.hasMany(models.RoomRegistration, { foreignKey: 'adminId' });
            Admin.hasMany(models.HealthCheck, { foreignKey: 'adminId' });
        }
    }
    Admin.init(
        {
            ...defineUserBaseFields(DataTypes),
        },
        {
            sequelize,
            modelName: 'Admin',
            tableName: 'Admins',
            timestamps: true
        }
    );

    return Admin;
};
