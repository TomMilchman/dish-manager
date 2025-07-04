const mongoose = require("mongoose");
const { Colors } = require("../constants/enums");

const dishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 24,
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
    isFavorite: {
        type: Boolean,
        default: false,
    },
    cardColor: {
        type: String,
        enum: Object.values(Colors),
        default: "white",
    },
});

const Dish = mongoose.model("Dish", dishSchema);

module.exports = Dish;
