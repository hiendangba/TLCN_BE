'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            // Một user có thể là admin hoặc student
            User.hasOne(models.Student, { foreignKey: 'userId' });
            User.hasOne(models.Admin, { foreignKey: 'userId' });
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            identification: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            dob: {
                type: DataTypes.DATE,
            },
            gender: {
                type: DataTypes.STRING,
            },
            phone: {
                type: DataTypes.STRING,
                unique: true,
            },
            email: {
                type: DataTypes.STRING,
                unique: true,
                validate: { isEmail: true },
            },
            nation: {
                type: DataTypes.STRING,
            },
            apostate: {
                type: DataTypes.STRING,
            },
            avatar: {
                type: DataTypes.STRING,
            },
            address: {
                type: DataTypes.STRING,
            },
            status: {
                type: DataTypes.STRING,
            },
            frontIdentificationImage: {
                type: DataTypes.STRING,
            },
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'Users',
            timestamps: true,
        }
    );

    return User;
};
