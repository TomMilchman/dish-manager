const jwt = require("jsonwebtoken");

/**
 * Express middleware to authenticate JWT tokens in the Authorization header.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {void}
 */
const authenticateTokenMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "Access denied. No token provided." });
    }

    const accessToken = authHeader.split(" ")[1];

    try {
        /** @type {JwtPayload} */
        const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.user = { userId: payload.userId, role: payload.role };
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

module.exports = { authenticateTokenMiddleware };
