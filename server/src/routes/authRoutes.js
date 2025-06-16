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
const router = express.Router();

router.post("/login", login);
router.post("/register", validateRegisterMiddleware, register);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
