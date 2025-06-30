const express = require("express");

const authController = require("../controllers/authController.js");
const { validatePart } = require("../middlewares/inputValidationMiddleware");
const {
    authenticateTokenMiddleware,
} = require("../middlewares/authenticateTokenMiddleware.js");
const authSchemas = require("../schemas/authSchemas.js");

const router = express.Router();

// Token routes
router.post(
    "/refresh",
    validatePart(authSchemas.refreshSchema, "cookies"),
    authController.refresh
);
router.post("/authenticate-user", authenticateTokenMiddleware, (req, res) => {
    return res.status(200).json({ message: "User authenticated." });
});
router.post(
    "/logout",
    validatePart(authSchemas.logoutSchema, "user"),
    authenticateTokenMiddleware,
    authController.logout
);

// Registration and login
router.post(
    "/register",
    validatePart(authSchemas.registerSchema, "body"),
    authController.register
);
router.post(
    "/login",
    validatePart(authSchemas.loginSchema, "body"),
    authController.login
);

// Password reset
router.post(
    "/forgot-password",
    validatePart(authSchemas.forgotPasswordSchema, "body"),
    authController.forgotPassword
);
router.post(
    "/reset-password",
    validatePart(authSchemas.resetPasswordSchema, "body"),
    authController.resetPassword
);

module.exports = router;
