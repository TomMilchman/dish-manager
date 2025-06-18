const app = require("./app.js");
const { PORT, HOST_URL } = require("./config/config");

// TODO: Setup HTTPS requests over HTTP
app.listen(PORT, () => {
    console.log(`Server is listening on ${HOST_URL}`);
});
