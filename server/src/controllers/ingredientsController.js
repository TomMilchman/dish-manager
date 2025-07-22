const Ingredient = require("../models/Ingredient");
const { getPriceField } = require("../utils/ingredientUtils");
const { logInfo, logError, logWarning } = require("../utils/logger");

/**
 * Creates a new ingredient and saves it to the database.
 *
 * @param {import("express").Request} req - Express request object. Expects `name`, `unitType`, and `price` in `req.body`.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function createIngredient(req, res) {
    const { name, unitType, price, tags, imageUrl } = req.body;

    const existingIngredient = await Ingredient.findOne({ name });

    if (existingIngredient) {
        logWarning(
            "create ingredient",
            `Admin tried to create an ingredient that already exists: ${name}`
        );
        return res.status(409).json({
            message: "An ingredient with the same name already exists.",
        });
    }

    if (!["unit", "gram", "liter"].includes(unitType)) {
        logWarning(
            "create ingredient",
            `Admin tried to create an ingredient with a unit type that doesn't exist: ${unitType}`
        );
        return res.status(400).json({
            message: "Invalid unitType. Must be 'unit', 'gram', or 'liter'.",
        });
    }

    const priceField = getPriceField(unitType, price);

    try {
        const newIngredient = await Ingredient.create({
            name,
            unitType,
            ...priceField,
            tags,
            imageUrl,
        });

        logInfo("create ingredient", `New ingredient "${name}" added.`);

        res.status(201).json({
            ingredient: newIngredient,
        });
    } catch (err) {
        logError("create ingredient", `Error creating "${name}": ${err}`);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Retrieves all ingredients from the database.
 *
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function getAllIngredients(req, res) {
    const { userId } = req.user;

    try {
        const ingredients = await Ingredient.find();

        logInfo(
            "get all ingredients",
            `Obtained all ingredients for user ID ${userId}`
        );
        res.status(200).json({ ingredients });
    } catch (err) {
        logError(
            "get all ingredients",
            `Error retrieving ingredients for user ID ${userId}: ${err}`
        );
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Updates an existing ingredient by ID with provided fields. Returns the updated ingredient.
 *
 * @param {import("express").Request} req - Express request object. Expects `ingredientId` in `req.params` and updated fields (object) in `req.body`.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function updateIngredient(req, res) {
    try {
        const { ingredientId } = req.params;
        const updates = req.body;

        const priceField = getPriceField(updates.unitType, updates.price);
        const { price, ...rest } = updates;

        const ingredient = await Ingredient.findByIdAndUpdate(
            ingredientId,
            { ...rest, ...priceField },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!ingredient) {
            return res.status(404).json({ message: "Ingredient not found." });
        }

        logInfo(
            "update ingredient",
            `Updated ingredient ${ingredient.name} (ID ${ingredientId})`
        );
        res.status(200).json({ ingredient });
    } catch (err) {
        logError("update ingredient", `Error updating ingredient: ${err}`);
        res.status(500).json({ message: "Internal server error." });
    }
}

module.exports = {
    createIngredient,
    getAllIngredients,
    updateIngredient,
};
