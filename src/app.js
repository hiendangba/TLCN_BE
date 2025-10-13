// src/app.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./config/database');
const routes = require("./routes/index.route");

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use("/api", routes);


// Sync database (chỉ dùng trong dev, production dùng migration)
sequelize.sync({ alter: true })
  .then(() => console.log('Database synced'))
  .catch(err => console.error('DB sync error:', err));

module.exports = app;
