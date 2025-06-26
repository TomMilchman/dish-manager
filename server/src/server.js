const app = require("./app.js");
const { PORT, HOST_URL } = require("./config/config");
const logger = require("./utils/logger");

// TODO: Setup HTTPS requests over HTTP
app.listen(PORT, () => {
    logger.log("server", `Server is listening on ${HOST_URL}`);
});
