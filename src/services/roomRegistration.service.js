const { Room, RoomRegistration, RoomSlot, Student, User, Admin } = require("../models");
const RoomError = require("../errors/RoomError");
const UserError = require("../errors/UserError");
const RoomRegistrationError = require("../errors/RoomRegistrationError");
const { StudentStatus } = require("../dto/request/auth.request")

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
        } catch (err) {
            throw err;
        }
    },

    getRoomRegistration: async () => {
        try {
            const roomRegistration = await RoomRegistration.findAll({
                where: {
                    approvedDate: null,
                },
                include: [
                    {
                        model: Student,
                        attributes: ['id', 'mssv', 'school', 'userId'],
                        include: [
                            {
                                model: User,
                                attributes: ['id', 'name', 'dob', 'gender', 'address']
                            }
                        ]
                    },
                    {
                        model: RoomSlot,
                        attributes: ['id', 'slotNumber', 'isOccupied']
                    }
                ]
            });

            return roomRegistration;
        } catch (err) {
            throw err;
        }
    },

    approveRoomRegistration: async (approvedRoomRegistrationRequest) => {
        try {
            const admin = await Admin.findOne({
                where: { id: approvedRoomRegistrationRequest.adminId }
            })

            if (!admin) {
                throw UserError.AdminNotFound();
            }

            const roomRegistration = await RoomRegistration.findOne({
                where: { id: approvedRoomRegistrationRequest.id },
                include: [
                    {
                        model: Student,
                        as: 'Student', // nếu trong associate bạn có dùng alias
                        attributes: ['userId']
                    },
                ],
            });

            if (!roomRegistration) {
                throw RoomRegistrationError.IdNotFount();
            }

            if (roomRegistration.adminId && roomRegistration.approvedDate) {
                throw RoomRegistrationError.AlreadyApproved();
            }


            const roomSlot = await RoomSlot.findOne({
                where: { id: roomRegistration.roomSlotId }
            })

            if (!roomSlot) {
                throw new RoomRegistrationError.RoomSlotNotFound();
            }

            await roomRegistration.update({
                approvedDate: new Date(),
                adminId: admin.id,
            });
            await roomSlot.update({ isOccupied: true });
            await roomRegistration.reload();

            await User.update(
                { status: StudentStatus.APPROVED_NOT_CHANGED },
                { where: { id: roomRegistration.Student.userId } }
            ); 
            return roomRegistration;
        } catch (err) {
            throw err;
        }
    }
};
module.exports = roomRegistrationServices;