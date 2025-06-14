const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

app.use(express.json());

connectDB();

// Routing
app.use("/auth", authRoutes);

module.exports = app;
