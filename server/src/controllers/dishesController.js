const Dish = require("../models/Dish");
const { logInfo, logError, logWarning } = require("../utils/logger");

/**
 * Creates a new dish for the authenticated user and saves it to the database.
 *
 * Request Body:
 * - name: string (required) – The name of the dish.
 * - ingredients: array (required) – Array of ingredient objects:
 *   [
 *     {
 *       ingredient: string (ObjectId of Ingredient),
 *       amount: number
 *     },
 *     ...
 *   ]
 *
 * Response on success (201 Created):
 * {
 *   dish: {
 *     _id: string,
 *     name: string,
 *     ingredients: [
 *       {
 *         ingredient: {
 *           _id: string,
 *           name: string,
 *           unitType: string,
 *           One of pricePerUnit, pricePer100g, or pricePerLiter (Number)
 *           ...
 *         },
 *         amount: number
 *       }
 *     ],
 *     owner: string (user ObjectId),
 *     __v: number
 *   }
 * }
 *
 * @param {import("express").Request} req - Express request object. Assumes `req.user.userId` is set by authentication middleware.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function createUserDish(req, res) {
    const userId = req.user.userId;
    const { name, ingredients } = req.body;

    if (
        typeof name !== "string" ||
        name.trim() === "" ||
        !Array.isArray(ingredients) ||
        ingredients.length === 0
    ) {
        logWarning(
            "create user dish",
            `User ${userId} tried to create dish with invalid or missing arguments.`
        );
        return res.status(400).json({
            message: "Dish must have a name and at least one ingredient.",
        });
    }

    if (name.length > 30) {
        logWarning(
            "create user dish",
            `User ${userId} tried to create a dish with name exceeding allowed name length.`
        );
        return res
            .status(400)
            .json({ message: "Dish name is too long (max characters is 30)" });
    }

    try {
        const existingDish = await Dish.findOne({ name });

        if (existingDish) {
            logWarning(
                "create user dish",
                `User ${userId} tried to create dish ${name}, which already exists in DB.`
            );
            return res.status(400).json({
                message: "Dish with exact name already exists.",
            });
        }

        const createdDish = await Dish.create({
            name,
            ingredients,
            owner: userId,
        });
        const newDish = await Dish.findById(createdDish._id).populate(
            "ingredients.ingredient"
        );

        logInfo(
            "create user dish",
            `User ID ${userId} created new dish "${name}" (ID: ${newDish._id})`
        );

        res.status(201).json({
            dish: newDish,
        });
    } catch (err) {
        logError(
            "create user dish",
            `Error creating dish for user ID ${userId}: ${err}`
        );
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Fetch all dishes based on the user's role.
 *       - If the user is an admin, returns all dishes from all users.
 *       - If the user is a regular user, returns only their own dishes.
 * Response on success (200 OK):
 * {
 *   dishes: [
 *    {
 *     _id: string,
 *     name: string,
 *     ingredients: [
 *       {
 *         ingredient: {
 *           _id: string,
 *           name: string,
 *           unitType: string,
 *           One of pricePerUnit, pricePer100g, or pricePerLiter (Number)
 *           ...
 *         },
 *         amount: number
 *       }
 *     ],
 *     owner: string (user ObjectId),
 *     __v: number
 *    },
 *    ...
 *   ]
 * }
 */
async function getDishes(req, res) {
    const { userId, role } = req.user;

    try {
        let dishes;

        if (role === "admin") {
            dishes = await Dish.find()
                .populate("ingredients.ingredient")
                .populate("owner", "username email");

            logInfo("get all dishes", `Admin retrieved all dishes.`);
        } else {
            dishes = await Dish.find({ owner: userId }).populate(
                "ingredients.ingredient"
            );

            if (dishes.length === 0) {
                logInfo(
                    "get user dishes",
                    `No dishes found for user ID ${userId}`
                );
                return res
                    .status(200)
                    .json({ message: "No dishes found for user." });
            }

            logInfo(
                "get user dishes",
                `Retrieved ${dishes.length} dish(es) for user ID ${userId}`
            );
        }

        res.status(200).json({ dishes });
    } catch (err) {
        logError("get dishes", `Error retrieving dishes: ${err}`);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Retrieves a single dish by ID for the authenticated user.
 * Admins can access any dish, normal users can only access their own.
 *
 * Response on success (200 OK):
 * {
 *   dish: {
 *     _id: string,
 *     name: string,
 *     ingredients: [
 *       {
 *         ingredient: {
 *           _id: string,
 *           name: string,
 *           unitType: string,
 *           One of pricePerUnit, pricePer100g, or pricePerLiter (Number)
 *           ...
 *         },
 *         amount: number
 *       }
 *     ],
 *     owner: string (user ObjectId),
 *     __v: number
 *   }
 * }
 *
 * @param {import("express").Request} req - Express request object. Assumes `req.user.userId` and `req.user.role` are set.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function getUserDishById(req, res) {
    const dishId = req.params.id;
    const userId = req.user.userId;

    try {
        let dish;

        if (req.user.role === "admin") {
            dish = await Dish.findById(dishId).populate(
                "ingredients.ingredient"
            );
        } else {
            dish = await Dish.findById(dishId)
                .where("owner")
                .equals(userId)
                .populate("ingredients.ingredient");
        }

        if (!dish) {
            logInfo(
                "GET USER DISH BY ID",
                `No dish found with ID ${dishId} for user ID ${userId}`
            );
            return res.status(404).json({ message: "Dish not found" });
        }

        logInfo(
            "GET USER DISH BY ID",
            `Retrieved dish ID ${dishId} for user ID ${userId}`
        );
        res.status(200).json({ dish });
    } catch (err) {
        logError(
            "GET USER DISH BY ID",
            `Error retrieving dish ID ${dishId}: ${err}`
        );
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Updates a dish by ID if it belongs to the authenticated user,
 * or allows update if the user is an admin.
 *
 * Request Body: Fields to update (e.g., name, ingredients).
 *
 * Response on success (200 OK):
 * {
 *   dish: {
 *     _id: string,
 *     name: string,
 *     ingredients: [
 *       {
 *         ingredient: {
 *           _id: string,
 *           name: string,
 *           unitType: string,
 *           One of pricePerUnit, pricePer100g, or pricePerLiter (Number)
 *           ...
 *         },
 *         amount: number
 *       }
 *     ],
 *     owner: string (user ObjectId),
 *     __v: number
 *   }
 * }
 *
 * @param {import("express").Request} req - Express request object. Expects `dishId` in params.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function updateDish(req, res) {
    const { dishId } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    try {
        const dish = await Dish.findById(dishId);

        if (!dish) {
            return res.status(404).json({ message: "Dish not found." });
        }

        if (dish.owner.toString() !== userId && role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        Object.assign(dish, req.body);
        await dish.save();

        logInfo(
            "UPDATE DISH",
            `Dish ${dish.name} (ID ${dishId}) updated by user ID ${userId} (${role})`
        );

        res.status(200).json({ dish });
    } catch (err) {
        logError("UPDATE DISH", `Error updating dish ID ${dishId}: ${err}`);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Deletes a dish by ID if it belongs to the authenticated user,
 * or allows deletion if the user is an admin.
 *
 * Response on success (200 OK):
 * {
 *   message: "Dish successfully deleted."
 * }
 *
 * @param {import("express").Request} req - Express request object. Expects `id` in route params.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function deleteDish(req, res) {
    const { dishId } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    try {
        const dish = await Dish.findById(dishId);

        if (!dish) {
            logInfo(
                "DELETE DISH",
                `Dish ID ${dishId} not found for user ID ${userId}`
            );

            return res.status(404).json({ message: "Dish not found." });
        }

        if (dish.owner.toString() !== userId && role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        await dish.deleteOne();

        logInfo(
            "DELETE DISH",
            `Dish ${dish.name} (ID ${dishId}) deleted by user ID ${userId} (${role})`
        );

        res.status(200).json({ message: "Dish successfully deleted." });
    } catch (err) {
        logError("DELETE DISH", `Error deleting dish ID ${dishId}: ${err}`);
        res.status(500).json({ message: "Internal server error." });
    }
}

module.exports = {
    createUserDish,
    getDishes,
    getUserDishById,
    updateDish,
    deleteDish,
};
