const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            minLength: 3,
            maxLength: 20,
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
            minLength: 6,
            maxLength: 1024, // hashed passwords can be long
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    {
        timestamps: true, // adds createdAt and updatedAt fields
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
