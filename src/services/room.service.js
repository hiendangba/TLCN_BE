const { RoomType, Floor } = require("../models");

const roomServices = {
    createRoomType: async (createRoomTypeRequest) => {
        try {
            const roomType = await RoomType.create(createRoomTypeRequest);
            return roomType;
        } catch (err) {
            throw err;
        }
    },
};
module.exports = roomServices;