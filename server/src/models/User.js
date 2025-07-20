const mongoose = require("mongoose");
const Dish = require("./Dish");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 20,
        },
        usernameLower: {
            type: String,
            required: true,
            unique: true,
            index: true,
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

// After a user is deleted, remove all their dishes
userSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        try {
            await Dish.deleteMany({ owner: doc._id });
            console.info(`Deleted all dishes owned by user ${doc._id}`);
        } catch (err) {
            console.error(`Failed to delete dishes for user ${doc._id}: `, err);
        }
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
