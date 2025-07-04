const mongoose = require("mongoose");
const { Tags } = require("../constants/enums");

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        maxLength: 20,
    },
    unitType: {
        type: String,
        enum: ["unit", "gram", "liter"],
        required: true,
    },
    pricePerUnit: {
        type: Number,
        required: function () {
            return this.unitType === "unit";
        },
    },
    pricePer100g: {
        type: Number,
        required: function () {
            return this.unitType === "gram";
        },
    },
    pricePerLiter: {
        type: Number,
        required: function () {
            return this.unitType === "liter";
        },
    },
    imageUrl: {
        type: String,
    },
    tags: [
        {
            type: String,
            enum: Object.values(Tags),
        },
    ],
});

const Ingredient = mongoose.model("Ingredient", ingredientSchema);

module.exports = Ingredient;
