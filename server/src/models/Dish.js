const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    ingredients: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: Ingredient,
        },
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
    },
});

const Dish = mongoose.model("Dish", dishSchema);

module.exports = Dish;
