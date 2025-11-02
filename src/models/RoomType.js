'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class RoomType extends Model {
        static associate(models) {
            RoomType.hasMany(models.Room, { foreignKey: 'roomTypeId', });
            RoomType.belongsToMany(models.Building, {
                through: 'BuildingRoomTypes',
                foreignKey: 'roomTypeId',
                otherKey: 'buildingId'
            });
        }
    }

    RoomType.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amenities: {
            type: DataTypes.JSON,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: 'RoomType',
        tableName: 'RoomTypes',
        timestamps: true
    });

    return RoomType;
};
