const express = require("express");
const { dishesList } = require("../controllers/dishesController");
const {
    authenticateTokenMiddleware,
} = require("../middlewares/authenticateTokenMiddleware");
const {
    authorizeAdminMiddleware,
} = require("../middlewares/authorizeAdminMiddleware");
const router = express.Router();

//---------------------------- DISHES ROUTES ----------------------------------
// List all dishes
router.get("/dishes", authenticateTokenMiddleware, dishesList);

//----------------------- INGREDIENTS ROUTES ----------------------------------
// Create an ingredient (requires admin rights)
router.post(
    "/ingredients",
    authenticateTokenMiddleware,
    authorizeAdminMiddleware,
    createIngredient
);

module.exports = router;
