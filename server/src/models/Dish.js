const mongoose = require("mongoose");
const { COLOR_MAP } = require("../constants/colorMap");
const { TagDefinitions } = require("../constants/tagDefinitions");

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
        enum: Object.keys(COLOR_MAP),
        default: "white",
    },
    tags: [
        {
            type: String,
            enum: TagDefinitions.map(({ tag }) => tag),
            default: [],
        },
    ],
});

const Dish = mongoose.model("Dish", dishSchema);

module.exports = Dish;
