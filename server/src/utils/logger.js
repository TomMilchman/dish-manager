const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const ENABLE_FILE_LOGGING = process.env.ENABLE_FILE_LOGGING === "true";
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, "../logs/");

/**
 * Returns the current timestamp in a human-readable format: "YYYY-MM-DD HH:MM:SS".
 *
 * Example:
 *   "2025-06-25 15:42:10"
 *
 * @returns {string} A formatted timestamp string.
 */
function formatTimestamp() {
    return new Date().toISOString().replace("T", " ").split(".")[0];
}

function getLogFilePath() {
    const today = new Date().toISOString().split("T")[0]; // e.g. "2025-06-25"
    return path.join(LOG_DIR, `dish_manager_server-${today}.log`);
}

/**
 * Writes a log message to the directory specified in the LOG_DIR environment variable.
 * Only runs if ENABLE_FILE_LOGGING is set to "true" in the environment.
 * Automatically creates the log directory if it doesn't exist.
 *
 * @param {string} log - The formatted log message to append to the log file.
 */
function writeToFile(log) {
    if (!ENABLE_FILE_LOGGING) return;

    const logFilePath = getLogFilePath();

    if (!fs.existsSync(path.dirname(logFilePath))) {
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    }

    fs.appendFile(logFilePath, log + "\n", (err) => {
        if (err) console.error("[LOGGER] Failed to write to log file:", err);
    });
}

/**
 * Logs a message to the console and optionally to a file, including a timestamp, source, and type.
 *
 * @param {"info" | "warn" | "error" | "log"} type - The type of log message.
 * @param {string} source - The source of the message (e.g. "AUTH", "DB", "GET DISHES").
 * @param {string} message - The log content.
 *
 * Example:
 *   logMessage("info", "AUTH", "User login succeeded");
 *   // Console output: [2025-06-25 15:42:10] [AUTH] [INFO] User login succeeded
 */

function logMessage(type, source, message) {
    const timestamp = formatTimestamp();
    const upperSource = source.toUpperCase();
    const upperType = type.toUpperCase();

    const formatted = `[${timestamp}] [${upperSource}] [${upperType}] ${message}`;

    const colored = `${chalk.gray(`[${timestamp}]`)} ${chalk.blue(
        `[${upperSource}]`
    )} ${
        type === "error"
            ? chalk.red(`[${upperType}]`)
            : type === "info"
            ? chalk.green(`[${upperType}]`)
            : type === "warn"
            ? chalk.yellow(`[${upperType}]`)
            : chalk.cyan(`[${upperType}]`)
    } ${chalk.white(message)}`;

    writeToFile(formatted);

    switch (type) {
        case "info":
            console.info(colored);
            break;
        case "error":
            console.error(colored);
            break;
        default:
            console.log(colored);
    }
}

module.exports = {
    logInfo: (source, message) => logMessage("info", source, message),
    logError: (source, message) => logMessage("error", source, message),
    logWarning: (source, message) => logMessage("warn", source, message),
    log: (source, message) => logMessage("log", source, message),
};
