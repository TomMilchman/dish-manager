const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const apiRoutes = require("./routes/apiRoutes");

app.use(express.json());

connectDB();

// Routing
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

module.exports = app;
