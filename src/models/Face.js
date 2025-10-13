'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Face extends Model {
        static associate(models) {
            Face.hasOne(models.Student, { foreignKey: 'faceId' });
        }
    }

    Face.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        faceImage: {
            type: DataTypes.JSON,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: 'Face',
        tableName: 'Faces'
    });
    return Face;
};
