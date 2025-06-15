const jwt = require("jsonwebtoken");

/**
 * @typedef {Object} JwtPayload
 * @property {string} userId
 * @property {string} [role]
 * @property {number} iat
 * @property {number} exp
 */

/**
 * Express middleware to authenticate JWT tokens in the Authorization header.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {void}
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        /** @type {JwtPayload} */
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

module.exports = { authenticateToken };
