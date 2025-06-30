const express = require("express");
const router = express.Router();

// Controllers
const dishesController = require("../controllers/dishesController");
const ingredientsController = require("../controllers/ingredientsController");

// Middlewares
const {
    authenticateTokenMiddleware,
} = require("../middlewares/authenticateTokenMiddleware");
const {
    authorizeAdminMiddleware,
} = require("../middlewares/authorizeAdminMiddleware");
const { validatePart } = require("../middlewares/inputValidationMiddleware");

// Schemas
const sharedSchemas = require("../schemas/sharedSchemas");
const ingredientsSchemas = require("../schemas/ingredientsSchemas");
const dishesSchemas = require("../schemas/dishesSchemas");

// Apply token authentication to all routes below
router.use(authenticateTokenMiddleware);

// ---------------------------- DISHES ROUTES ----------------------------
router
    .route("/dishes")
    .post(
        validatePart(sharedSchemas.userIdAndRoleSchema, "user"),
        validatePart(dishesSchemas.createUserDishSchema, "body"),
        dishesController.createUserDish
    )
    .get(
        validatePart(sharedSchemas.userIdAndRoleSchema, "user"),
        dishesController.getDishes
    );

router
    .route("/dishes/:dishId")
    .get(
        validatePart(dishesSchemas.dishIdSchema, "params"),
        validatePart(sharedSchemas.userIdAndRoleSchema, "user"),
        dishesController.getUserDishById
    )
    .put(
        validatePart(sharedSchemas.userIdAndRoleSchema, "user"),
        validatePart(dishesSchemas.dishIdSchema, "params"),
        validatePart(dishesSchemas.updateDishSchema, "body"),
        dishesController.updateDish
    )
    .delete(
        validatePart(sharedSchemas.userIdAndRoleSchema, "user"),
        validatePart(dishesSchemas.dishIdSchema, "params"),
        dishesController.deleteDish
    );

// ------------------------- INGREDIENTS ROUTES --------------------------
// Accessible by all authenticated users
router.get(
    "/ingredients",
    validatePart(sharedSchemas.userIdAndRoleSchema, "user"),
    ingredientsController.getAllIngredients
);
router.get(
    "/ingredients/:ingredientId",
    validatePart(sharedSchemas.userIdAndRoleSchema, "user"),
    validatePart(ingredientsSchemas.ingredientIdSchema, "params"),
    ingredientsController.getIngredientById
);

// Admin-only routes for modifying ingredients
router.post(
    "/ingredients",
    authorizeAdminMiddleware,
    validatePart(ingredientsSchemas.createIngredientSchema, "body"),
    ingredientsController.createIngredient
);

router
    .route("/ingredients/:ingredientId")
    .put(
        authorizeAdminMiddleware,
        validatePart(ingredientsSchemas.ingredientIdSchema, "params"),
        validatePart(ingredientsSchemas.updateIngredientSchema, "body"),
        ingredientsController.updateIngredient
    )
    .delete(
        authorizeAdminMiddleware,
        validatePart(ingredientsSchemas.ingredientIdSchema, "params"),
        ingredientsController.deleteIngredient
    );

module.exports = router;
