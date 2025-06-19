const Ingredient = require("../models/Ingredient");

/**
 * Creates a new ingredient and saves it to the database.
 *
 * @param {import("express").Request} req - Express request object. Expects `name`, `price`, and `imageUrl` in `req.body`.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function createIngredient(req, res) {
    const { name, price, imageUrl } = req.body;

    try {
        await Ingredient.create({ name, price, imageUrl });

        console.info(
            `[CREATE INGREDIENT] New ingredient "${name}" has been added to DB.`
        );

        res.status(201).json({
            message: `Ingredient "${name}" has been created.`,
        });
    } catch (err) {
        console.error(
            `[CREATE INGREDIENT] Error creating ingredient "${name}":`,
            err
        );
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
    try {
        const ingredients = await Ingredient.find();

        res.status(200).json({ ingredients });
    } catch (err) {
        console.error(
            `[GET ALL INGREDIENTS] Error retrieving ingredients:`,
            err
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
    try {
        const ingredient = await Ingredient.findById(req.params.id);

        if (!ingredient) {
            return res.status(404).json({ message: "Ingredient not found." });
        }

        res.status(200).json({ ingredient });
    } catch (err) {
        console.error(
            `[GET INGREDIENT BY ID] Error retrieving ingredient:`,
            err
        );
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Updates an existing ingredient by ID with provided fields.
 *
 * @param {import("express").Request} req - Express request object. Expects `id` in `req.params` and updated fields in `req.body`.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function updateIngredient(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;

        const ingredient = await Ingredient.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!ingredient) {
            return res.status(404).json({ message: "Ingredient not found." });
        }

        res.status(200).json({ ingredient });
    } catch (err) {
        console.error(`[UPDATE INGREDIENT] Error updating ingredient:`, err);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Deletes an ingredient by its ID.
 *
 * @param {import("express").Request} req - Express request object. Expects `id` in `req.params`.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function deleteIngredient(req, res) {
    try {
        const { id } = req.params;
        const ingredient = await Ingredient.findByIdAndDelete(id);

        if (!ingredient) {
            return res.status(404).json({ message: "Ingredient not found." });
        }

        console.info(
            `[DELETE INGREDIENT] Ingredient deleted: ${ingredient.name} (ID: ${ingredient._id})`
        );

        res.status(200).json({ message: "Ingredient successfully deleted." });
    } catch (err) {
        console.error(`[DELETE INGREDIENT] Error deleting ingredient:`, err);
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
