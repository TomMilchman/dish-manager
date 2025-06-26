const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logger.log("connect db", "MongoDB connected");
    } catch (err) {
        logger.logError(
            "connect db",
            `MongoDB connection failed: ${err.message}`
        );
        process.exit(1); // exit on failure
    }
};

module.exports = connectDB;
