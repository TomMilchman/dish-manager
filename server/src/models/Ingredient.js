const mongoose = require("mongoose");
const { TagDefinitions } = require("../constants/tagDefinitions");

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
        lowercase: true,
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
    tags: [
        {
            type: String,
            enum: TagDefinitions.map(({ tag }) => tag),
            lowercase: true,
        },
    ],
    imageUrl: {
        type: String,
        default: "",
    },
});

const Ingredient = mongoose.model("Ingredient", ingredientSchema);

module.exports = Ingredient;
