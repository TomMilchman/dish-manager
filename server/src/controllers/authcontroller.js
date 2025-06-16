const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authService = require("../services/authService");
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
        console.info(`[LOGIN] Attempting login for: ${usernameOrEmail}`);

        const user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        });

        if (!user) {
            console.warn(`[LOGIN] User ${usernameOrEmail} not found.`);
            return res
                .status(401)
                .json({ message: "Invalid login credentials." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.warn(`[LOGIN] Incorrect password for ${usernameOrEmail}.`);
            return res
                .status(401)
                .json({ message: "Invalid login credentials." });
        }

        const { accessToken, refreshToken } = authService.generateTokens(
            user._id,
            rememberMe
        );

        res.cookie(
            "refreshToken",
            refreshToken,
            authService.getRefreshCookieOptions(rememberMe)
        );

        console.info(
            `[LOGIN] Login successful for ${usernameOrEmail}, tokens issued.`
        );
        res.json({ accessToken });
    } catch (err) {
        console.error(`[LOGIN] Unexpected error for ${usernameOrEmail}:`, err);
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
        // Check if user exists by username or email
        const existingUser = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (existingUser) {
            console.warn(
                `[REGISTER] Attempt to register with existing username/email: ${username}, ${email}`
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
            email,
            password: hashedPassword,
        });

        console.info(
            `[REGISTER] New user registered: ${createdUser._id} (${username})`
        );

        // Generate tokens
        const { accessToken, refreshToken } = authService.generateTokens(
            createdUser._id,
            rememberMe
        );

        // Set refresh token cookie
        res.cookie(
            "refreshToken",
            refreshToken,
            authService.getRefreshCookieOptions(rememberMe)
        );

        // TODO: Write a better welcome message
        // Send confirmation email
        await sendEmail({
            to: createdUser.email,
            subject: "Welcome to Dish Manager!",
            text: `Hey there ${createdUser.username}! Thank you for registering to Dish Manager!`,
        });

        // Respond with access token
        res.status(201).json({ accessToken });
    } catch (err) {
        console.error(`[REGISTER] Error occurred for ${username}:`, err);
        res.status(500).json({ message: "Internal server error." });
    }
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
            { userId: payload.userId },
            process.env.JWT_SECRET,
            { expiresIn: payload.rememberMe ? "7d" : "15m" }
        );

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(403).json({ message: "Invalid refresh token" });
    }
}

module.exports = { login, register, refresh };
