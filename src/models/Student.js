'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Student extends Model {
        static associate(models) {
            Student.belongsTo(models.User, { foreignKey: 'userId' });
            Student.belongsTo(models.Face, { foreignKey: 'faceId' });
            Student.hasMany(models.RegisterHealthCheck, { foreignKey: 'studentId' });
            Student.hasMany(models.RoomRegistration, { foreignKey: 'studentId' });
            Student.hasMany(models.Payment, { foreignKey: 'studentId' });
            Student.hasOne(models.NumberPlate, { foreignKey: 'studentId' });
        }
    }
    Student.init(
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
            mssv: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            school: {
                type: DataTypes.STRING,
                allowNull: true
            }
        },
        {
            sequelize,
            modelName: 'Student',
            tableName: 'Students',
            timestamps: true
        }
    );

    return Student;
};
