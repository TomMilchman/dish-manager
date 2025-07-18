const app = require("./app.js");
const isProduction = process.env.NODE_ENV === "production";
const { PORT, HOST_URL } = require("./config/config");
const logger = require("./utils/logger");

app.listen(PORT, () => {
    if (!isProduction)
        logger.log("server", `Server is listening on ${HOST_URL}`);
});
