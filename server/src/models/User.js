const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 20,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            maxlength: 1024, // hashed passwords can be long
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt fields
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
