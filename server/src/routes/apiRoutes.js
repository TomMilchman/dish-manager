const express = require("express");
import * as dishesController from "../controllers/dishesController";
import * as ingredientsController from "../controllers/ingredientsController";
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
// Accessible by all authenticated users
router
    .route("/dishes")
    .post(dishesController.createUserDish)
    .get(dishesController.getAllUserDishes);

router
    .route("/dishes/:id")
    .get(dishesController.getUserDishById)
    .put(dishesController.updateDish)
    .delete(dishesController.deleteDish);

// Admin-only routes for modifying ingredients
router.get("/admin/dishes", dishesController.getAllDishes);

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
