const express = require("express");
const {
    login,
    register,
    refresh,
    forgotPassword,
    resetPassword,
    logout,
} = require("../controllers/authController.js");
const {
    validateRegisterMiddleware,
    validateNoEmptyBodyParamsMiddleware,
} = require("../middlewares/inputValidationMiddlewares");
const {
    authenticateTokenMiddleware,
} = require("../middlewares/authenticateTokenMiddleware.js");

const router = express.Router();

// Token routes
router.post("/refresh", refresh);
router.post("/authenticate-user", authenticateTokenMiddleware, (req, res) => {
    return res.status(200).json({ message: "User authenticated." });
});
router.post("/logout", authenticateTokenMiddleware, logout);

// Registration and login
router.post("/register", validateRegisterMiddleware, register);
router.post("/login", validateNoEmptyBodyParamsMiddleware, login);

// Password reset
router.post(
    "/forgot-password",
    validateNoEmptyBodyParamsMiddleware,
    forgotPassword
);
router.post(
    "/reset-password",
    validateNoEmptyBodyParamsMiddleware,
    resetPassword
);

module.exports = router;
