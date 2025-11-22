// src/app.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./config/database');
const routes = require("./routes/index.route");
const app = express();
const errorMiddleware = require("./middlewares/error.middleware");
const cookieParser = require("cookie-parser");


(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
})();

app.use(cors({
  origin: ["*"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use("/api", routes);
app.use(errorMiddleware);

module.exports = app;
