const authService = require("../services/authService");
const User = require("../models/User");

/**
 * Handles user login by verifying credentials and issuing access and refresh tokens.
 *
 * - Looks up the user by username or email.
 * - Compares the provided password with the hashed one in the database.
 * - If valid, generates JWT access and refresh tokens.
 * - Stores the refresh token in an HTTP-only cookie.
 * - Sends the access token in the response body.
 *
 * @param {import("express").Request} req - Express request object. Expects `usernameOrEmail`, `password`, and optional `rememberMe` in `req.body`.
 * @param {import("express").Response} res - Express response object. Responds with access token or an error message.
 * @returns {Promise<void>}
 */
async function login(req, res) {
    try {
        const { usernameOrEmail, password, rememberMe } = req.body;

        const user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.staus(401).json({ message: "Invalid login credentials." });
        }

        const { accessToken, refreshToken } = authService.generateTokens(
            user._id,
            rememberMe
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000,
        });

        res.json({ accessToken });
    } catch (err) {
        res.status(400).json({ message: err.message });
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
            { expiresIn: rememberMe ? "7d" : "15m" }
        );

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(403).json({ message: "Invalid refresh token" });
    }
}

module.exports = { login, refresh };
