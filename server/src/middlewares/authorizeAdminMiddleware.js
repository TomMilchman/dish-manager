const { logWarning } = require("../utils/logger");

/**
 * Middleware to authorize admin users.
 *
 * Checks if `req.user.role` is `"admin"`.
 * If not, responds with HTTP 403 Forbidden.
 * Otherwise, passes control to the next middleware.
 *
 * Assumes that `req.user` has been set previously (e.g., by authentication middleware).
 *
 * @param {import("express").Request} req - Express request object, expected to have `user.role`.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Next middleware function.
 * @returns {void}
 */
const authorizeAdminMiddleware = (req, res, next) => {
    if (req.user?.role !== "admin") {
        logWarning(
            "authorize admin middleware",
            `User ID ${req.user?.userId} tried to access an admin only action, but is ${req.user?.role}.`
        );
        return res.status(403).json({ message: "Admin access required." });
    }

    next();
};

module.exports = { authorizeAdminMiddleware };
