const Dish = require("../models/Dish");

/**
 * Creates a new dish for the authenticated user and saves it to the database.
 *
 * @param {import("express").Request} req - Express request object. Assumes `req.user.userId` is set by authentication middleware.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function createUserDish(req, res) {
    const userId = req.user.userId;
    const { name, ingredients } = req.body;

    try {
        const newDish = await Dish.create({ name, ingredients, owner: userId });

        console.info(
            `[CREATE USER DISH] User ID ${userId} created new dish "${name}" (ID: ${newDish._id})`
        );

        res.status(201).json({
            message: "Successfully created user dish.",
            dish: newDish,
        });
    } catch (err) {
        console.error(
            `[CREATE USER DISH] Error creating dish for user ID ${userId}:`,
            err
        );
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Retrieves all dishes owned by the authenticated user.
 *
 * @param {import("express").Request} req - Express request object. Assumes `req.user.userId` is set by authentication middleware.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function getAllUserDishes(req, res) {
    const userId = req.user.userId;

    try {
        const dishes = await Dish.find({ owner: userId });

        if (dishes.length === 0) {
            console.info(
                `[GET USER DISHES] No dishes found for user ID ${userId}`
            );
            return res
                .status(404)
                .json({ message: "No dishes found for user." });
        }

        console.info(
            `[GET USER DISHES] Retrieved ${dishes.length} dish(es) for user ID ${userId}`
        );
        res.status(200).json({ dishes });
    } catch (err) {
        console.error(
            `[GET USER DISHES] Error retrieving dishes for user ID ${userId}:`,
            err
        );
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Retrieves a single dish by ID for the authenticated user.
 * Admins can access any dish, while normal users can only access their own dishes.
 *
 * @param {import("express").Request} req - Express request object. Assumes `req.user.userId` and `req.user.role` are set by authentication middleware.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function getUserDishById(req, res) {
    const dishId = req.params.id;
    const userId = req.user.userId;

    try {
        let dish;

        if (req.user.role === "admin") {
            dish = await Dish.findById(dishId);
        } else {
            dish = await Dish.findById(dishId).where("owner").equals(userId);
        }

        if (!dish) {
            console.info(
                `[GET USER DISH BY ID] No dish found with ID ${dishId} for user ID ${userId}`
            );
            return res.status(404).json({ message: "Dish not found" });
        }

        console.info(
            `[GET USER DISH BY ID] Retrieved dish ID ${dishId} for user ID ${userId}`
        );
        res.status(200).json({ dish });
    } catch (err) {
        console.error(
            `[GET USER DISH BY ID] Error retrieving dish ID ${dishId}:`,
            err
        );
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Retrieves all dishes in the system. Accessible only to admins.
 *
 * @param {import("express").Request} req - Express request object. Assumes `req.user.role` is set.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function getAllDishes(req, res) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required." });
    }

    try {
        const dishes = await Dish.find().populate("owner", "username");
        console.info(`[GET ALL DISHES] Admin retrieved all dishes.`);
        res.status(200).json({ dishes });
    } catch (err) {
        console.error(`[GET ALL DISHES] Error retrieving dishes:`, err);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Updates a dish if it belongs to the authenticated user,
 * or allows update if the user is an admin.
 *
 * @param {import("express").Request} req - Express request object. Expects `id` in params and fields to update in body.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function updateDish(req, res) {
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    try {
        const dish = await Dish.findById(id);

        if (!dish) {
            return res.status(404).json({ message: "Dish not found." });
        }

        if (dish.owner.toString() !== userId && role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        Object.assign(dish, req.body);
        await dish.save();

        console.info(
            `[UPDATE DISH] Dish ID ${id} updated by user ID ${userId} (${role})`
        );

        res.status(200).json({ message: "Dish updated successfully.", dish });
    } catch (err) {
        console.error(`[UPDATE DISH] Error updating dish ID ${id}:`, err);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Deletes a dish if it belongs to the authenticated user,
 * or allows deletion if the user is an admin.
 *
 * @param {import("express").Request} req - Express request object. Expects `id` in route params.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function deleteDish(req, res) {
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    try {
        const dish = await Dish.findById(id);

        if (!dish) {
            return res.status(404).json({ message: "Dish not found." });
        }

        if (dish.owner.toString() !== userId && role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        await dish.deleteOne();

        console.info(
            `[DELETE DISH] Dish ID ${id} deleted by user ID ${userId} (${role})`
        );

        res.status(200).json({ message: "Dish successfully deleted." });
    } catch (err) {
        console.error(`[DELETE DISH] Error deleting dish ID ${id}:`, err);
        res.status(500).json({ message: "Internal server error." });
    }
}

module.exports = {
    createUserDish,
    getAllDishes,
    getAllUserDishes,
    updateDish,
    deleteDish,
    getUserDishById,
};
