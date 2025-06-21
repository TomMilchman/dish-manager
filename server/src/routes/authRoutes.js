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
    validateNoEmptyBodyParamsMiddleware,
} = require("../middlewares/inputValidationMiddlewares");
const {
    authenticateTokenMiddleware,
} = require("../middlewares/authenticateTokenMiddleware.js");
const router = express.Router();

router.post("/register", validateRegisterMiddleware, register);
router.post("/authenticate-user", authenticateTokenMiddleware, (req, res) => {
    return res.status(200).json({ message: "User authenticated." });
});
router.post("/refresh", refresh);

router.use(validateNoEmptyBodyParamsMiddleware);

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
