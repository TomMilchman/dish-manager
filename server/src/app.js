const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./config/db");

connectDB();

app.use(express.json());

module.exports = app;
