const jwt = require("jsonwebtoken");
const isProduction = process.env.NODE_ENV;

/**
 * @typedef {Object} Tokens
 * @property {string} accessToken - Short-lived token for accessing protected routes
 * @property {string} refreshToken - Long-lived token for obtaining new access tokens
 */

/**
 * Generates JWT access and refresh tokens for a user.
 *
 * @param {string} userId - The unique identifier of the user
 * @param {string} username - The user's username
 * @param {boolean} rememberMe - Whether the user chose "remember me" (affects token lifespan)
 * @param {"user" | "admin"} role - The user's role, either "user" or "admin"
 * @returns {Tokens} An object containing the access and refresh tokens
 */
const generateJWTTokens = (userId, username, rememberMe, role = "user") => {
    if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
        throw new Error("Missing JWT secret(s).");
    }

    if (!userId) {
        throw new Error("No user id provided.");
    }

    const accessToken = jwt.sign(
        { userId, username, role },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m",
        }
    );

    const refreshToken = jwt.sign(
        { userId, username, role },
        process.env.REFRESH_SECRET,
        {
            expiresIn: rememberMe ? "30d" : "1d",
        }
    );

    return { accessToken, refreshToken };
};

/**
 * Returns cookie configuration options for setting the HTTP-only refresh token.
 *
 * - Ensures security by setting `httpOnly`, `secure`, and `sameSite` flags.
 * - Dynamically sets the cookie's lifetime (`maxAge`) based on the `rememberMe` value.
 *
 * @param {boolean} rememberMe - Indicates whether the user opted to be remembered.
 *                               If true, sets a longer cookie duration (30 days); otherwise, 1 day.
 * @returns {import("express").CookieOptions} - Configuration object to be passed to `res.cookie()`.
 */
function getRefreshCookieOptions(rememberMe) {
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000,
    };
}

module.exports = { generateJWTTokens, getRefreshCookieOptions };
