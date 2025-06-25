const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        maxLength: 30,
    },
    ingredients: [
        {
            ingredient: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Ingredient",
                required: true,
            },
            amount: {
                type: Number,
                required: true,
            },
        },
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

const Dish = mongoose.model("Dish", dishSchema);

module.exports = Dish;
