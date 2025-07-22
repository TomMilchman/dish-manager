const connectDB = require("../src/config/db");
const mongoose = require("mongoose");

const User = require("../src/models/User");
const Ingredient = require("../src/models/Ingredient");
const Dish = require("../src/models/Dish");

require("dotenv").config();

console.log("CLEANUP SCRIPT START----------------------------------");

async function runCleanup() {
    try {
        await connectDB();
        console.log("Connected to MongoDB");

        // 1. Get all existing ingredient and user IDs
        const existingIngredientsDocs = await Ingredient.find({})
            .select("_id")
            .lean();
        const existingIngredients = existingIngredientsDocs.map((d) => d._id);

        const existingUsersDocs = await User.find({}).select("_id").lean();
        const existingUsers = existingUsersDocs.map((d) => d._id);

        // 2. Remove invalid ingredient references from all dishes
        await Dish.updateMany({}, [
            {
                $set: {
                    ingredients: {
                        $filter: {
                            input: "$ingredients",
                            as: "ing",
                            cond: {
                                $in: ["$$ing.ingredient", existingIngredients],
                            },
                        },
                    },
                },
            },
        ]);
        console.log("Removed invalid ingredient references from all dishes.");

        // 3. Delete dishes that now have no ingredients
        await Dish.deleteMany({ ingredients: { $size: 0 } });
        console.log("Removed dishes with no ingredients.");

        // 4. Delete dishes where the owner no longer exists
        await Dish.deleteMany({ owner: { $nin: existingUsers } });
        console.log("Removed dishes whose owners were deleted.");

        // Close the DB connection
        await mongoose.connection.close();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Cleanup failed:", error);
    }
}

runCleanup();
