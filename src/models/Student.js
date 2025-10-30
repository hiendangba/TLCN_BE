'use strict';
const { UserBase, defineUserBaseFields } = require('./base/UserBase');

module.exports = (sequelize, DataTypes) => {
    class Student extends UserBase {
        static associate(models) {
            Student.belongsTo(models.Face, { foreignKey: 'faceId', as: 'face' });
            Student.hasMany(models.RegisterHealthCheck, { foreignKey: 'studentId' });
            Student.hasMany(models.RoomRegistration, { foreignKey: 'studentId' });
            Student.hasMany(models.Payment, { foreignKey: 'studentId' });
            Student.hasOne(models.NumberPlate, { foreignKey: 'studentId' });
        }
    }
    Student.init(
        {
            ...defineUserBaseFields(DataTypes),
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
