const Dish = require("../models/Dish");
const Ingredient = require("../models/Ingredient");
const { COLOR_MAP } = require("../constants/colorMap");
const { resolveTags } = require("../utils/resolveTags");

exports.validateIngredientIds = async (ingredientIds) => {
    const ingredientDocs = await Ingredient.find({
        _id: { $in: ingredientIds },
    });
    if (ingredientDocs.length !== ingredientIds.length) {
        return null;
    }
    return ingredientDocs;
};

exports.resolveTagsFromIngredients = (ingredientDocs) => {
    const tagSet = new Set();

    for (const ing of ingredientDocs) {
        if (Array.isArray(ing.tags)) {
            ing.tags.forEach((tag) => tagSet.add(tag));
        }
    }

    return resolveTags(tagSet);
};

exports.isDuplicateDishName = async ({ name, ownerId, excludeId = null }) => {
    const query = Dish.findOne({ name, owner: ownerId });
    if (excludeId) query.where("_id").ne(excludeId);
    const existing = await query.exec();
    return !!existing;
};

exports.validateCardColor = (inputColor, fallback = "white") => {
    return Object.keys(COLOR_MAP).includes(inputColor) ? inputColor : fallback;
};
