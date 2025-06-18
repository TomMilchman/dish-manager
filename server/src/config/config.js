require("dotenv").config();

const PORT = process.env.PORT || 5000;
const HOST_URL = `${process.env.HOST}:${PORT}`;

module.exports = { PORT, HOST_URL };
