const express = require("express");
const dishesController = require("../controllers/dishesController");
const ingredientsController = require("../controllers/ingredientsController");
const {
    authenticateTokenMiddleware,
} = require("../middlewares/authenticateTokenMiddleware");
const {
    authorizeAdminMiddleware,
} = require("../middlewares/authorizeAdminMiddleware");
const router = express.Router();

// Apply token authentication to all routes below
router.use(authenticateTokenMiddleware);

// ---------------------------- DISHES ROUTES ----------------------------
router
    .route("/dishes")
    .post(dishesController.createUserDish)
    .get(dishesController.getDishes);

router
    .route("/dishes/:id")
    .get(dishesController.getUserDishById)
    .put(dishesController.updateDish)
    .delete(dishesController.deleteDish);

router.get("dishes/aggregate", dishesController.aggregateIngredientsFromDishes);

// ------------------------- INGREDIENTS ROUTES --------------------------
// Accessible by all authenticated users
router.get("/ingredients", ingredientsController.getAllIngredients);
router.get("/ingredients/:id", ingredientsController.getIngredientById);

// Admin-only routes for modifying ingredients
router.post(
    "/ingredients",
    authorizeAdminMiddleware,
    ingredientsController.createIngredient
);

router
    .route("/ingredients/:id")
    .put(authorizeAdminMiddleware, ingredientsController.updateIngredient)
    .delete(authorizeAdminMiddleware, ingredientsController.deleteIngredient);

module.exports = router;
