const express = require("express");
const {
    login,
    register,
    refresh,
    forgotPassword,
    resetPassword,
} = require("../controllers/authController");
const {
    validateRegisterMiddleware,
} = require("../middlewares/validateAuthInputMiddleware");
const {
    authenticateTokenMiddleware,
} = require("../middlewares/authenticateTokenMiddleware.js");
const router = express.Router();

router.post("/login", login);
router.post("/register", validateRegisterMiddleware, register);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/authenticate-user", authenticateTokenMiddleware, (req, res) => {
    return res.status(200).json({ message: "User authenticated." });
});

module.exports = router;
