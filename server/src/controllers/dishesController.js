const Dish = require("../models/Dish");

/**
 * Creates a new dish for the authenticated user and saves it to the database.
 *
 * Request Body:
 * - name: string (required) – The name of the dish.
 * - ingredients: ObjectId[] (required) – Array of ingredient IDs to associate with the dish.
 *
 * Response on success (201 Created):
 * {
 *   message: "Successfully created user dish.",
 *   dish: {
 *     _id: string,
 *     name: string,
 *     ingredients: ObjectId[],
 *     owner: ObjectId,
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
 * Response on success (200 OK):
 * {
 *   dishes: [
 *     {
 *       _id: string,
 *       name: string,
 *       ingredients: Array<Object>,
 *       owner: ObjectId,
 *       __v: number
 *     },
 *     ...
 *   ]
 * }
 *
 * @param {import("express").Request} req - Express request object. Assumes `req.user.userId` is set by authentication middleware.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function getAllUserDishes(req, res) {
    const userId = req.user.userId;

    try {
        const dishes = await Dish.find({ owner: userId }).populate(
            "ingredients"
        );

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
 * Admins can access any dish, normal users can only access their own.
 *
 * Response on success (200 OK):
 * {
 *   dish: {
 *     _id: string,
 *     name: string,
 *     ingredients: Array<Object>,
 *     owner: ObjectId,
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
            dish = await Dish.findById(dishId).populate("ingredients");
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
 * Retrieves all dishes in the system. Admin-only access.
 *
 * Response on success (200 OK):
 * {
 *   dishes: [
 *     {
 *       _id: string,
 *       name: string,
 *       ingredients: Array<Object>, // Populated ingredient objects
 *       owner: {
 *         _id: string,
 *         username: string,
 *         email: string
 *       },
 *       __v: number
 *     },
 *     ...
 *   ]
 * }
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
        const dishes = await Dish.find()
            .populate("ingredients")
            .populate("owner", "username email");

        console.info(`[GET ALL DISHES] Admin retrieved all dishes.`);
        res.status(200).json({ dishes });
    } catch (err) {
        console.error(`[GET ALL DISHES] Error retrieving dishes:`, err);
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
 *   message: "Dish updated successfully.",
 *   dish: {
 *     _id: string,
 *     name: string,
 *     ingredients: ObjectId[],
 *     owner: ObjectId,
 *     __v: number
 *   }
 * }
 *
 * @param {import("express").Request} req - Express request object. Expects `id` in params.
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

/**
 * Aggregates ingredients from multiple dishes and returns a combined list,
 * including total quantity and cost per ingredient.
 *
 * Only includes user-owned dishes if the user is not an admin.
 *
 * Request Body:
 * - dishIds: Array of dish IDs to aggregate ingredients from.
 *
 * Response on success (200 OK):
 * {
 *   totalIngredientsPrice: number,
 *   ingredients: [
 *     {
 *       name: string,
 *       pricePerUnit: number,
 *       count: number,
 *       totalPrice: number
 *     },
 *     ...
 *   ]
 * }
 *
 * @param {import("express").Request} req - Express request object. Expects `dishIds` array in `req.body`.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function aggregateIngredientsFromDishes(req, res) {
    const { userId, role } = req.user;
    const dishIds = req.body.dishIds;

    if (!Array.isArray(dishIds) || dishIds.length === 0) {
        return res.status(400).json({ message: "No dish IDs provided." });
    }

    try {
        const query =
            role === "admin"
                ? { _id: { $in: dishIds } }
                : { _id: { $in: dishIds }, owner: userId };

        const dishes = await Dish.find(query).populate("ingredients");

        const ingredientMap = {};
        let totalIngredientsPrice = 0;

        for (const dish of dishes) {
            for (const ingredient of dish.ingredients) {
                const id = ingredient._id.toString();

                if (!ingredientMap[id]) {
                    ingredientMap[id] = {
                        name: ingredient.name,
                        pricePerUnit: ingredient.price,
                        count: 1,
                        totalPrice: ingredient.price,
                    };
                } else {
                    ingredientMap[id].count += 1;
                    ingredientMap[id].totalPrice += ingredient.price;
                }

                totalIngredientsPrice += ingredient.price;
            }
        }

        const aggregatedIngredients = Object.values(ingredientMap);
        res.status(200).json({
            totalIngredientsPrice,
            ingredients: aggregatedIngredients,
        });
    } catch (err) {
        console.error(
            `[AGGREGATE INGREDIENTS] Error aggregating ingredients for user ${userId}:`,
            err
        );
        res.status(500).json({ message: "Internal server error." });
    }
}

module.exports = {
    createUserDish,
    getAllUserDishes,
    getUserDishById,
    getAllDishes,
    updateDish,
    deleteDish,
    aggregateIngredientsFromDishes,
};
