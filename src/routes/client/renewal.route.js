const express = require("express");
const renewalRouter = express.Router();
const { authMiddleware, isAdmin } = require("../../middlewares/auth.middleware");
const renewalController = require("../../controllers/renewal.controller");
renewalRouter.post("/", authMiddleware, isAdmin, renewalController.createRenewal);
renewalRouter.patch("/", authMiddleware, isAdmin, renewalController.stopRenewal);
renewalRouter.get("/active", authMiddleware, renewalController.getActive);
renewalRouter.get("/history", authMiddleware, isAdmin, renewalController.getHistory);
module.exports = renewalRouter;
