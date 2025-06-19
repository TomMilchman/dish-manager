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

//---------------------------- DISHES ROUTES ----------------------------------
// NON ADMIN ROUTES
router.get("/dishes", authenticateTokenMiddleware, dishesController.dishesList);

//----------------------- INGREDIENTS ROUTES ----------------------------------
// NON ADMIN ROUTES
router.get(
    "/ingredients",
    authenticateTokenMiddleware,
    ingredientsController.getAllIngredients
);

router.get(
    "/ingredients:id",
    authenticateTokenMiddleware,
    ingredientsController.getIngredientById
);

// ADMIN ROUTES
router.post(
    "/ingredients",
    authenticateTokenMiddleware,
    authorizeAdminMiddleware,
    ingredientsController.createIngredient
);

router.put(
    "/ingredients:id",
    authenticateTokenMiddleware,
    authorizeAdminMiddleware,
    ingredientsController.updateIngredient
);

router.delete(
    "/ingredients:id",
    authenticateTokenMiddleware,
    authorizeAdminMiddleware,
    ingredientsController.deleteIngredient
);

module.exports = router;
