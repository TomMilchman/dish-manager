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

// -------------------------- Middleware Shortcuts --------------------------

const validateUser = validatePart(sharedSchemas.userIdAndRoleSchema, "user");

// Dishes
const validateDishId = validatePart(dishesSchemas.dishIdSchema, "params");
const validateCreateDish = validatePart(
    dishesSchemas.createUserDishSchema,
    "body"
);
const validateUpdateDish = validatePart(dishesSchemas.updateDishSchema, "body");

// Ingredients
const validateIngredientId = validatePart(
    ingredientsSchemas.ingredientIdSchema,
    "params"
);
const validateCreateIngredient = validatePart(
    ingredientsSchemas.createIngredientSchema,
    "body"
);
const validateUpdateIngredient = validatePart(
    ingredientsSchemas.updateIngredientSchema,
    "body"
);

// --------------------------- Global Middleware ----------------------------

// Authenticated access for all routes
router.use(authenticateTokenMiddleware);
router.use(validateUser); // all routes expect a validated user

// ---------------------------- DISHES ROUTES ----------------------------

router
    .route("/dishes")
    .post(validateCreateDish, dishesController.createUserDish)
    .get(dishesController.getDishes);

router
    .route("/dishes/:dishId")
    .get(validateDishId, dishesController.getUserDishById)
    .patch(validateDishId, validateUpdateDish, dishesController.updateDish)
    .delete(validateDishId, dishesController.deleteDish);

router.patch(
    "/dishes/:dishId/toggle-favorite",
    validateDishId,
    dishesController.toggleIsFavorite
);

// ------------------------- INGREDIENTS ROUTES --------------------------

// Accessible by all authenticated users
router.get("/ingredients", ingredientsController.getAllIngredients);

router.get(
    "/ingredients/:ingredientId",
    validateIngredientId,
    ingredientsController.getIngredientById
);

router.get("/tags", ingredientsController.getAllTags);

// Admin-only routes
router.post(
    "/ingredients",
    authorizeAdminMiddleware,
    validateCreateIngredient,
    ingredientsController.createIngredient
);

router
    .route("/ingredients/:ingredientId")
    .patch(
        authorizeAdminMiddleware,
        validateIngredientId,
        validateUpdateIngredient,
        ingredientsController.updateIngredient
    )
    .delete(
        authorizeAdminMiddleware,
        validateIngredientId,
        ingredientsController.deleteIngredient
    );

module.exports = router;
