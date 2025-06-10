const app = require("./app");
// const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is listening on https://localhost:${PORT}`);
}).catch((err) => {
    console.error("Error connecting to server: ", err);
});
