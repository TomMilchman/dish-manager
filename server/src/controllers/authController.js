const logger = require("../utils/logger");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authService = require("../services/authService");
const crypto = require("crypto");
const User = require("../models/User");
const { sendEmail } = require("../services/emailService");

/**
 * Handles user login by verifying credentials and issuing access and refresh tokens.
 *
 * Workflow:
 * 1. Finds user by username or email.
 * 2. Verifies the provided password against the hashed one in the database.
 * 3. On success:
 *    - Generates JWT access and refresh tokens.
 *    - Sets the refresh token in an HTTP-only cookie.
 *    - Sends the access token in the response body.
 *
 * Errors:
 * - 401 Unauthorized for invalid credentials.
 * - 400 Bad Request for internal failures.
 *
 * @param {import("express").Request} req - Express request object. Requires `usernameOrEmail`, `password`, and optionally `rememberMe` in `req.body`.
 * @param {import("express").Response} res - Express response object. Sends access token in JSON or error message.
 * @returns {Promise<void>}
 */
async function login(req, res) {
    const { usernameOrEmail, password, rememberMe } = req.body;

    try {
        logger.logInfo("login", `Attempting login for: ${usernameOrEmail}`);
        const lowerCasedUsernameOrEmail = usernameOrEmail.toLowerCase();

        const user = await User.findOne({
            $or: [
                { usernameLower: lowerCasedUsernameOrEmail },
                { email: lowerCasedUsernameOrEmail },
            ],
        });

        if (!user) {
            logger.logWarning("login", `User ${usernameOrEmail} not found.`);
            return res
                .status(401)
                .json({ message: "Invalid login credentials." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            logger.logWarning(
                "login",
                `Incorrect password for ${usernameOrEmail}.`
            );
            return res
                .status(401)
                .json({ message: "Invalid login credentials." });
        }

        const { accessToken, refreshToken } = authService.generateJWTTokens(
            user._id,
            user.username,
            rememberMe,
            user.role
        );

        res.cookie(
            "refreshToken",
            refreshToken,
            authService.getRefreshCookieOptions(rememberMe)
        );

        logger.logInfo(
            "login",
            `Login successful for ${usernameOrEmail}, tokens issued.`
        );
        res.json({ accessToken });
    } catch (err) {
        logger.logError(
            "login",
            `Unexpected error for ${usernameOrEmail}: ${err}`
        );
        res.status(400).json({ message: err.message });
    }
}

/**
 * Handles user registration.
 *
 * - Validates input data (should be done via middleware).
 * - Checks for existing username or email in the database.
 * - Hashes the password.
 * - Creates a new user record.
 * - Issues access and refresh tokens.
 * - Sends access token in response, sets refresh token in HTTP-only cookie.
 *
 * Errors:
 * - 401 Unauthorized for invalid credentials.
 * - 500 Internal server error.
 *
 * @param {import("express").Request} req - Express request object. Expects `username`, `email`, `password`, `rememberMe` in `req.body`.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function register(req, res) {
    const { username, email, password, rememberMe } = req.body;

    try {
        const usernameLower = username.toLowerCase();

        // Check if user exists by username or email
        const existingUser = await User.findOne({
            $or: [{ usernameLower }, { email }],
        });

        if (existingUser) {
            logger.logWarning(
                "register",
                `Attempt to register with existing username/email: ${username}, ${email}`
            );
            return res
                .status(409)
                .json({ message: "Username or email already in use." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const createdUser = await User.create({
            username,
            usernameLower,
            email,
            password: hashedPassword,
        });

        logger.logInfo(
            "register",
            `New user registered: ${createdUser._id} (${username})`
        );

        // Generate tokens
        const { accessToken, refreshToken } = authService.generateJWTTokens(
            createdUser._id,
            createdUser.username,
            rememberMe,
            createdUser.role
        );

        // Set refresh token cookie
        res.cookie(
            "refreshToken",
            refreshToken,
            authService.getRefreshCookieOptions(rememberMe)
        );

        // Send confirmation email
        await sendEmail({
            to: email,
            subject: "Welcome to Dish Manager!",
            text: `Hey there ${username}!\nThank you for registering to Dish Manager!`,
        });

        res.status(201).json({
            accessToken,
        });
    } catch (err) {
        logger.logError("register", `Error occurred for ${username}: ${err}`);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Logs out the user by clearing the refresh token cookie.
 *
 * Workflow:
 * - Clears the `refreshToken` cookie from the client.
 * - Ensures cookie options match those used during login (e.g. `httpOnly`, `sameSite`, `secure`).
 * - Responds with a 200 status and a logout confirmation message.
 *
 * Notes:
 * - This does not require access to the JWT or user data.
 *
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object. Sends a JSON message on success.
 * @returns {void}
 */
function logout(req, res) {
    const userId = req.user?.userId;
    logger.logInfo("logout", `User ID ${userId} logged out`);

    res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
    });

    res.status(200).json({ message: "Logged out successfully." });
}

/**
 * Issues a new access token using a valid refresh token from cookies.
 *
 * - Verifies the refresh token stored in `req.cookies.refreshToken`.
 * - If valid, signs and returns a new access token.
 * - Token expiration is based on the original "remember me" setting embedded in the payload or inferred separately.
 *
 * @param {import("express").Request} req - Express request object. Expects `refreshToken` in `req.cookies`.
 * @param {import("express").Response} res - Express response object. Responds with a new access token or an error message.
 * @returns {void}
 */
function refresh(req, res) {
    const token = req.cookies.refreshToken;

    if (!token) return res.status(401).json({ message: "No refresh token" });

    try {
        const payload = jwt.verify(token, process.env.REFRESH_SECRET);

        const newAccessToken = jwt.sign(
            {
                userId: payload.userId,
                username: payload.username,
                role: payload.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        logger.logInfo(
            "refresh",
            `Refreshed cookies for user ID ${payload.userId}`
        );
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        logger.logError("refresh", `Failed to refresh cookies: ${err}`);
        res.status(403).json({ message: "Invalid refresh token" });
    }
}

/**
 * Handles a user's "forgot password" request by generating a password reset token
 * and sending a reset link via email. Responds with a generic message to avoid
 * revealing user existence.
 *
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 */
async function forgotPassword(req, res) {
    const { email } = req.body;
    logger.logInfo("forgot password", `Password reset requested for: ${email}`);

    try {
        const user = await User.findOne({ email });

        // Always respond with the same message for security reasons
        if (!user) {
            logger.logInfo(
                "forgot password",
                `No user found with email: ${email}`
            );
            return res
                .status(200)
                .json({ message: "If user exists, email sent." });
        }

        // Generate raw and hashed reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Set token and expiry on user model
        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 1000 * 60 * 15; // 15 minutes
        await user.save();

        const resetLink = `${process.env.CLIENT_URL}/reset-password?resetToken=${resetToken}&email=${user.email}`;

        // Send password reset email
        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            text: `Reset your password using the following link: ${resetLink}`,
        });

        logger.logInfo(
            "forgot password",
            `Password reset email sent to: ${user.email}`
        );

        res.status(200).json({ message: "If user exists, email sent." });
    } catch (error) {
        logger.logError(
            "forgot password",
            `Error processing request for: ${email}, ${error}`
        );
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * Resets a user's password using the token, the new password and email provided in the request.
 * Verifies the token and expiry, hashes the new password, and updates the user.
 *
 * @param {import("express").Request} req - Express request object. Expects `email`, `token`, and `password` in `req.body`.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function resetPassword(req, res) {
    const { email, resetToken, password } = req.body;

    logger.logInfo(
        "reset password",
        `Password reset attempt for email: ${email}`
    );

    try {
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Find user with matching email and valid reset token
        const user = await User.findOne({
            email: email.toLowerCase(),
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            logger.logWarning(
                "reset password",
                `Invalid or expired token for email: ${email}`
            );
            return res
                .status(400)
                .json({ message: "Invalid or expired reset token." });
        }

        // Hash and set new password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        // Clear reset token fields
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();
        logger.logInfo(
            "reset password",
            `Password successfully reset for email: ${email}`
        );

        await sendEmail({
            to: user.email,
            subject: "Password Has Been Reset",
            text: `Hi, ${user.username}.\nWe wanted to let you know that your password has been reset.\nIf this was not done by you, please change your password again and make sure to do the same for your email address.`,
        });
        logger.logInfo(
            "reset password",
            `Notification email sent to: ${user.email}`
        );

        res.status(200).json({ message: "Password successfully reset." });
    } catch (err) {
        logger.logError(
            "reset password",
            `Error resetting password for email: ${email}, ${err}`
        );
        res.status(500).json({ message: "Internal server error." });
    }
}

module.exports = {
    login,
    register,
    refresh,
    forgotPassword,
    resetPassword,
    logout,
};
