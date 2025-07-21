const Dish = require("../models/Dish");
const Ingredient = require("../models/Ingredient");
const { logInfo, logError, logWarning } = require("../utils/logger");
const dishUtils = require("../utils/dishUtils");

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
 * - cardColor: string (optional) – Card color for the dish (must be one of the allowed values; default: "white").
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
 *           unitType: "unit" | "gram" | "liter",
 *           pricePerUnit?: number,
 *           pricePer100g?: number,
 *           pricePerLiter?: number,
 *           imageUrl?: string,
 *           tags?: string[],
 *         },
 *         amount: number
 *       }
 *     ],
 *     owner: string,
 *     isFavorite: boolean,
 *     cardColor: string,
 *     tags: string[],
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
    const { name, ingredients, cardColor = "white" } = req.body;

    try {
        const isDuplicate = await dishUtils.isDuplicateDishName({
            name,
            ownerId: userId,
        });
        if (isDuplicate) {
            logWarning(
                "create user dish",
                `User ${userId} tried to create dish "${name}", which already exists.`
            );
            return res
                .status(409)
                .json({ message: "Dish name already exists." });
        }

        // Validate ingredient IDs
        const ingredientDocs = await dishUtils.validateIngredientIds(
            ingredients.map((i) => i.ingredient)
        );
        if (!ingredientDocs) {
            logWarning(
                "create user dish",
                `User ${userId} provided invalid ingredient IDs.`
            );
            return res
                .status(400)
                .json({ message: "Invalid ingredient(s) provided." });
        }

        // Derive dish-level tags from ingredient tags
        const resolvedTags =
            dishUtils.resolveTagsFromIngredients(ingredientDocs);

        // Validate cardColor
        const finalColor = dishUtils.validateCardColor(cardColor);

        // Create dish
        const newDish = await Dish({
            name,
            ingredients,
            owner: userId,
            isFavorite: false,
            cardColor: finalColor,
            tags: resolvedTags,
        });

        // Save the document to the database
        await newDish.save();

        // Populate the needed references on the same instance
        await newDish.populate("ingredients.ingredient");
        await newDish.populate("owner", "username");

        logInfo(
            "create user dish",
            `User ${userId} created dish "${name}" (ID: ${newDish._id})`
        );

        res.status(201).json({ dish: newDish });
    } catch (err) {
        logError(
            "create user dish",
            `Error creating dish for user ${userId}: ${err}`
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
 *           unitType: "unit" | "gram" | "liter",
 *           pricePerUnit?: number,    // present if unitType is "unit"
 *           pricePer100g?: number,    // present if unitType is "gram"
 *           pricePerLiter?: number,   // present if unitType is "liter"
 *           imageUrl?: string,
 *           tags?: string[],
 *         },
 *         amount: number
 *       }
 *     ],
 *     owner: string (user ObjectId),
 *     isFavorite: boolean,
 *     cardColor: string,
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
                .populate("owner", "username");

            logInfo("get all dishes", `Admin retrieved all dishes.`);
        } else {
            dishes = await Dish.find({ owner: userId })
                .populate("ingredients.ingredient")
                .populate("owner", "username");

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
 *         _id: string,
 *           name: string,
 *           unitType: "unit" | "gram" | "liter",
 *           pricePerUnit?: number,    // present if unitType is "unit"
 *           pricePer100g?: number,    // present if unitType is "gram"
 *           pricePerLiter?: number,   // present if unitType is "liter"
 *           imageUrl?: string,
 *           tags?: string[],
 *         },
 *         amount: number
 *       }
 *     ],
 *     owner: string (user ObjectId),
 *     isFavorite: boolean,
 *     cardColor: string,
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
 *           unitType: "unit" | "gram" | "liter",
 *           pricePerUnit?: number,    // present if unitType is "unit"
 *           pricePer100g?: number,    // present if unitType is "gram"
 *           pricePerLiter?: number,   // present if unitType is "liter"
 *           imageUrl?: string,
 *           tags?: string[],
 *         },
 *         amount: number
 *       }
 *     ],
 *     owner: string (user ObjectId),
 *     isFavorite: boolean,
 *     cardColor: string,
 *     tags?: string[]
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
    const { userId, role } = req.user;
    const { name, ingredients, cardColor } = req.body;

    try {
        const dish = await Dish.findById(dishId);

        if (!dish) {
            logWarning(
                "UPDATE DISH",
                `User ${userId} tried to update non-existent dish ${dishId}`
            );
            return res.status(404).json({ message: "Dish not found." });
        }

        const isOwner = dish.owner.toString() === userId;
        const isAdmin = role === "admin";

        if (!isOwner && !isAdmin) {
            logWarning(
                "UPDATE DISH",
                `User ${userId} attempted to update unauthorized dish ${dishId}`
            );
            return res.status(403).json({ message: "Access denied." });
        }

        const targetOwnerId = dish.owner.toString();
        const isDuplicate = await dishUtils.isDuplicateDishName({
            name,
            ownerId: targetOwnerId,
            excludeId: dishId,
        });

        if (isDuplicate) {
            logWarning(
                "UPDATE DISH",
                `User ID ${userId} attempted to update dish to an already existing dish name.`
            );
            return res
                .status(409)
                .json({ message: "A dish with this name already exists." });
        }

        const ingredientDocs = await dishUtils.validateIngredientIds(
            ingredients.map((i) => i.ingredient)
        );

        if (!ingredientDocs) {
            logWarning(
                "UPDATE DISH",
                `User ID ${userId} provided invalid ingredient IDs.`
            );
            return res
                .status(400)
                .json({ message: "Invalid ingredient(s) provided." });
        }

        const resolvedTags =
            dishUtils.resolveTagsFromIngredients(ingredientDocs);
        const finalColor = dishUtils.validateCardColor(
            cardColor,
            dish.cardColor
        );

        const filter = { _id: dishId };
        if (role !== "admin") filter.owner = userId;

        const updatedDish = await Dish.findOneAndUpdate(
            filter,
            {
                $set: {
                    name,
                    ingredients,
                    tags: resolvedTags,
                    cardColor: finalColor,
                },
            },
            { new: true }
        )
            .populate("ingredients.ingredient")
            .populate("owner", "username");

        if (!updatedDish) {
            // Not found or access denied
            const exists = await Dish.exists({ _id: dishId });
            return res.status(exists ? 403 : 404).json({
                message: exists ? "Access denied." : "Dish not found.",
            });
        }

        logInfo(
            "UPDATE DISH",
            `Dish "${dish.name}" (${dishId}) updated by user ${userId} (${role})`
        );

        res.status(200).json({ dish: updatedDish });
    } catch (err) {
        logError("UPDATE DISH", `Error updating dish ${dishId}: ${err}`);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Toggles the `isFavorite` status of a dish by ID if it belongs to the authenticated user,
 * or allows toggling if the user is an admin.
 *
 * Request Body: none.
 *
 * Response on success (200 OK):
 * {
 *   dish: {
 *     _id: string,
 *     name: string,
 *     isFavorite: boolean,
 *     cardColor: string,
 *     ingredients: [
 *       {
 *         _id: string,
 *           name: string,
 *           unitType: "unit" | "gram" | "liter",
 *           pricePerUnit?: number,    // present if unitType is "unit"
 *           pricePer100g?: number,    // present if unitType is "gram"
 *           pricePerLiter?: number,   // present if unitType is "liter"
 *           imageUrl?: string,
 *           tags?: string[],
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
async function toggleIsFavorite(req, res) {
    const { dishId } = req.params;
    const userId = req.user.userId;

    try {
        const updatedDish = await Dish.findOneAndUpdate(
            { _id: dishId, owner: userId },
            [{ $set: { isFavorite: { $not: "$isFavorite" } } }],
            { new: true }
        )
            .populate("ingredients.ingredient")
            .populate("owner", "username");

        if (!updatedDish) {
            // Dish not found or not owned by user
            const exists = await Dish.exists({ _id: dishId });
            return res.status(exists ? 403 : 404).json({
                message: exists ? "Access denied." : "Dish not found.",
            });
        }

        logInfo(
            "TOGGLE FAVORITE",
            `Dish ${updatedDish.name} (ID ${dishId}) favorite toggled to ${updatedDish.isFavorite} by user ID ${userId}`
        );

        res.status(200).json({ dish: updatedDish });
    } catch (err) {
        logError(
            "TOGGLE FAVORITE",
            `Error toggling favorite on dish ID ${dishId}: ${err}`
        );
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Deletes a dish by ID if it belongs to the authenticated user,
 * or allows deletion if the user is an admin.
 *
 * Response on success (200 OK):
 * {
 *   id: string,         // The ObjectId of the deleted dish
 *   name: string        // The name of the deleted dish
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
        // Build query conditions based on role
        const query = { _id: dishId };

        if (role !== "admin") {
            query.owner = userId; // Non-admins can only delete their own dishes
        }

        const deletedDish = await Dish.findOneAndDelete(query).select(
            "name owner"
        );

        if (!deletedDish) {
            // Determine if dish exists but is unauthorized
            const exists = await Dish.exists({ _id: dishId });

            return res.status(exists ? 403 : 404).json({
                message: exists ? "Access denied." : "Dish not found.",
            });
        }

        logInfo(
            "DELETE DISH",
            `Dish ${deletedDish.name} (ID ${dishId}) deleted by user ID ${userId} (${role})`
        );

        res.status(200).json({ id: dishId, name: deletedDish.name });
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
    toggleIsFavorite,
    deleteDish,
};
