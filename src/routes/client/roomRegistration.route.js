const express = require("express");
const roomRegistrationRouter = express.Router();
const { authMiddleware, isAdmin } = require("../../middlewares/auth.middleware");
const roomRegistrationController = require("../../controllers/roomRegistration.controller")
const validateRequest = require("../../middlewares/validateRequest");
const {
    approveRoomRegistrationSchema,
    rejectRoomRegistrationSchema,
    cancelRoomRegistrationSchema,
    approvedCancelRoomSchema,
    rejectCancelRoomSchema,
    movedRoomRegistrationSchema,
    approvedMoveRoomSchema,
    extendRoomRegistrationSchema,
    approvedExtendRoomSchema
} = require("../../validations/roomRegistration.validation")

roomRegistrationRouter.get("/", authMiddleware, isAdmin, roomRegistrationController.getRoomRegistration);
roomRegistrationRouter.patch("/", authMiddleware, isAdmin, validateRequest(approveRoomRegistrationSchema), roomRegistrationController.approveRoomRegistration);
roomRegistrationRouter.delete("/reject", authMiddleware, isAdmin, validateRequest(rejectRoomRegistrationSchema), roomRegistrationController.rejectRoomRegistration);

roomRegistrationRouter.delete("/cancel", authMiddleware, validateRequest(cancelRoomRegistrationSchema), roomRegistrationController.cancelRoomRegistration);
roomRegistrationRouter.get("/cancel-requests", authMiddleware, isAdmin, roomRegistrationController.getCancelRoom);
roomRegistrationRouter.patch("/cancel-requests/approve", authMiddleware, isAdmin, validateRequest(approvedCancelRoomSchema), roomRegistrationController.approveCancelRoom);
roomRegistrationRouter.patch("/cancel-requests/reject", authMiddleware, isAdmin, validateRequest(rejectCancelRoomSchema), roomRegistrationController.rejectCancelRoom);

roomRegistrationRouter.get("/move-requests", authMiddleware, isAdmin, roomRegistrationController.getRoomMove);
roomRegistrationRouter.patch("/request-move", authMiddleware, validateRequest(movedRoomRegistrationSchema), roomRegistrationController.requestRoomMove);
roomRegistrationRouter.patch("/approve-move", authMiddleware, isAdmin, validateRequest(approvedMoveRoomSchema), roomRegistrationController.approveRoomMove);

roomRegistrationRouter.get("/extend-requests", authMiddleware, isAdmin, roomRegistrationController.getExtendRoom);
roomRegistrationRouter.patch("/request-extend", authMiddleware, validateRequest(extendRoomRegistrationSchema), roomRegistrationController.requestRoomExtend);
roomRegistrationRouter.patch("/approve-extend", authMiddleware, isAdmin, validateRequest(approvedExtendRoomSchema), roomRegistrationController.approveRoomExtend);
module.exports = roomRegistrationRouter;
