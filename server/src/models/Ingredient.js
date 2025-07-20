const mongoose = require("mongoose");
const { TagDefinitions } = require("../constants/tagDefinitions");
const Dish = require("./Dish");

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

// Remove deleted ingredient from all dishes it's in
ingredientSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        try {
            await Dish.updateMany(
                {},
                { $pull: { ingredients: { ingredient: doc._id } } }
            );
            console.info(`Removed ${doc.name} from all dishes it was in`);
        } catch (err) {
            console.error(`Failed to remove ${doc.name} from all dishes:`, err);
        }
    }
});

const Ingredient = mongoose.model("Ingredient", ingredientSchema);

module.exports = Ingredient;
