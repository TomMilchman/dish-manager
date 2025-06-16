const jwt = require("jsonwebtoken");

/**
 * @typedef {Object} Tokens
 * @property {string} accessToken - Short-lived token for accessing protected routes
 * @property {string} refreshToken - Long-lived token for obtaining new access tokens
 */

/**
 * Generates JWT access and refresh tokens for a user.
 *
 * @param {string} userId - The unique identifier of the user
 * @param {boolean} rememberMe - Whether the user chose "remember me" (affects token lifespan)
 * @returns {Tokens} An object containing the access and refresh tokens
 */
const generateTokens = (userId, rememberMe) => {
    if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
        throw new Error("Missing JWT secret(s).");
    }

    if (!userId) {
        throw new Error("No user id provided.");
    }

    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: rememberMe ? "7d" : "15m",
    });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_SECRET, {
        expiresIn: rememberMe ? "30d" : "1d",
    });

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
        secure: true,
        sameSite: "Strict",
        maxAge: (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000,
    };
}

module.exports = { generateTokens, getRefreshCookieOptions };
