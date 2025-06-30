const Ingredient = require("../models/Ingredient");
const { logInfo, logError } = require("../utils/logger");

/**
 * Creates a new ingredient and saves it to the database.
 *
 * @param {import("express").Request} req - Express request object. Expects `name`, `unitType`, and one of the price fields in `req.body`.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function createIngredient(req, res) {
    const { name, unitType, pricePerUnit, pricePer100g, pricePerLiter } =
        req.body;

    if (!["unit", "gram", "liter"].includes(unitType)) {
        return res.status(400).json({
            message: "Invalid unitType. Must be 'unit', 'gram', or 'liter'.",
        });
    }

    let priceField;

    switch (unitType) {
        case "unit":
            priceField = { pricePerUnit };
            break;
        case "gram":
            priceField = { pricePer100g };
            break;
        case "liter":
            priceField = { pricePerLiter };
    }

    try {
        const newIngredient = await Ingredient.create({
            name,
            unitType,
            ...priceField,
        });

        logInfo("create ingredient", `New ingredient "${name}" added.`);

        res.status(201).json({
            message: `Ingredient "${name}" has been created.`,
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
 * Retrieves a single ingredient by its ID.
 *
 * @param {import("express").Request} req - Express request object. Expects `id` in `req.params`.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function getIngredientById(req, res) {
    const { userId } = req.user;
    const { ingredientId } = req.params;

    try {
        const ingredient = await Ingredient.findById(ingredientId);

        if (!ingredient) {
            return res.status(404).json({ message: "Ingredient not found." });
        }

        logInfo(
            "get ingredient by id",
            `Retrieved ingredient ${ingredient.name} (ID ${ingredientId}) for user ID ${userId}`
        );
        res.status(200).json({ ingredient });
    } catch (err) {
        logError(
            "get ingredient by id",
            `Error retrieving ingredient ID ${ingredientId} for user ID ${userId}: ${err}`
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
        const { ingredietnId } = req.params;
        const updates = req.body;

        const ingredient = await Ingredient.findByIdAndUpdate(
            ingredietnId,
            updates,
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
            `Updated ingredient ${ingredient.name} (ID ${dishId})`
        );
        res.status(200).json({ ingredient });
    } catch (err) {
        logError("update ingredient", `Error updating ingredient: ${err}`);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Deletes an ingredient by its ID.
 *
 * @param {import("express").Request} req - Express request object. Expects `ingredientId` in `req.params`.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function deleteIngredient(req, res) {
    const { ingredientId } = req.params;

    try {
        const ingredient = await Ingredient.findByIdAndDelete(ingredientId);

        if (!ingredient) {
            return res.status(404).json({ message: "Ingredient not found." });
        }

        logInfo(
            "delete ingredient",
            `Ingredient deleted: ${ingredient.name} (ID: ${ingredient._id})`
        );

        res.status(200).json({ message: "Ingredient successfully deleted." });
    } catch (err) {
        logError(
            "delete ingredient",
            `Error deleting ingredient ID ${ingredientId}: ${err}`
        );
        res.status(500).json({ message: "Internal server error." });
    }
}

module.exports = {
    createIngredient,
    getAllIngredients,
    getIngredientById,
    updateIngredient,
    deleteIngredient,
};
