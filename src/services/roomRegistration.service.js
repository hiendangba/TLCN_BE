const { Room, RoomRegistration, RoomSlot } = require("../models");
const RoomError = require("../errors/RoomError");
const roomRegistrationServices = {
    createRoomRegistration: async (createRoomRegistrationRequest, transaction) => {
        try {
            const roomSlot = await RoomSlot.findOne({
                where: { id: createRoomRegistrationRequest.roomSlotId },
                transaction
            });

            if (!roomSlot) {
                throw RoomError.RoomSlotNotFound();
            }

            if (roomSlot.isOccupied === true) {
                throw RoomError.RoomSlotIsOccupied();
            }
            await RoomRegistration.create(createRoomRegistrationRequest, { transaction })
            await roomSlot.update(
                { isOccupied: true },
                { transaction }
            );
        } catch (err) {
            throw err;
        }
    },

    //chức năng này đợi suy nghĩ sẽ làm sau
    getRoomRegistration: async () => {
        try {
            console.log("123123")
        } catch (err) {
            throw err;
        }
    },
};
module.exports = roomRegistrationServices;