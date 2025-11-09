// src/app.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./config/database');
const routes = require("./routes/index.route");
const app = express();
const errorMiddleware = require("./middlewares/error.middleware");


(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
})();

app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use("/api", routes);
app.use(errorMiddleware);



module.exports = app;
