const express = require("express");
const bankRouter = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const bankController = require("../../controllers/bank.controller");
bankRouter.get("/", authMiddleware, bankController.getBank);
module.exports = bankRouter;
