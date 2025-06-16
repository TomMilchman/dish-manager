const express = require("express");
const authController = require("../controllers/authController");
const validateRegisterMiddleware = require("../middlewares/validateAuthInputMiddleware");
const router = express.Router();

router.post("/login", authController.login);
router.post("/register", validateRegisterMiddleware, authController.register);
router.post("/refresh", authController.refresh);

module.exports = router;
