const app = require("./app.js");
// const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => res.send("Hello world!"));

app.use((req, res, next) => {
    res.status(404).send("Error 404: Not Found");
});

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
