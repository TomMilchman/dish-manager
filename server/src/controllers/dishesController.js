const Dish = require("../models/Dish");

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

    try {
        const createdDish = await Dish.create({
            name,
            ingredients,
            owner: userId,
        });
        const newDish = await Dish.findById(createdDish._id).populate(
            "ingredients.ingredient"
        );

        console.info(
            `[CREATE USER DISH] User ID ${userId} created new dish "${name}" (ID: ${newDish._id})`
        );

        res.status(201).json({
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

            console.info(`[GET ALL DISHES] Admin retrieved all dishes.`);
        } else {
            dishes = await Dish.find({ owner: userId }).populate("ingredients");

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
        }

        res.status(200).json({ dishes });
    } catch (err) {
        console.error(`[GET DISHES] Error retrieving dishes:`, err);
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
                .populate("ingredients");
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

        console.info(
            `[UPDATE DISH] Dish ID ${dishId} updated by user ID ${userId} (${role})`
        );

        res.status(200).json({ dish });
    } catch (err) {
        console.error(`[UPDATE DISH] Error updating dish ID ${dishId}:`, err);
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
            return res.status(404).json({ message: "Dish not found." });
        }

        if (dish.owner.toString() !== userId && role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        await dish.deleteOne();

        console.info(
            `[DELETE DISH] Dish ID ${dishId} deleted by user ID ${userId} (${role})`
        );

        res.status(200).json({ message: "Dish successfully deleted." });
    } catch (err) {
        console.error(`[DELETE DISH] Error deleting dish ID ${dishId}:`, err);
        res.status(500).json({ message: "Internal server error." });
    }
}

module.exports = {
    createUserDish,
    getDishes,
    getUserDishById,
    updateDish,
    deleteDish,
    aggregateIngredientsFromDishes,
};
