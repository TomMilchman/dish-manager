const Joi = require("joi");

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 25;

const usernameRule = Joi.string()
    .alphanum()
    .min(USERNAME_MIN_LENGTH)
    .max(USERNAME_MAX_LENGTH)
    .required();

const passwordRule = Joi.string()
    .min(PASSWORD_MIN_LENGTH)
    .max(PASSWORD_MAX_LENGTH)
    .required();

const emailRule = Joi.string().email().required();

const registerSchema = Joi.object({
    username: usernameRule,
    email: emailRule,
    password: passwordRule,
    rememberMe: Joi.bool().required(),
});

const _validateRegistration = (username, email, password, rememberMe) => {
    const inputData = { username, email, password, rememberMe };
    console.log("[Validation] Received data:", inputData);

    const { error } = registerSchema.validate(inputData);

    if (error) {
        console.log("[Validation] Error:", error.details[0].message);
        return { success: false, error: error.details[0].message };
    }

    console.log("[Validation] Passed");
    return { success: true };
};

const validateRegisterMiddleware = (req, res, next) => {
    console.log("[Middleware] Incoming request body:", req.body);

    const result = _validateRegistration(
        req.body.username,
        req.body.email,
        req.body.password,
        req.body.rememberMe
    );

    if (!result.success) {
        console.log("[Middleware] Validation failed:", result.error);
        return res.status(400).json({ message: result.error });
    }

    console.log("[Middleware] Validation succeeded");
    next();
};

module.exports = {
    validateRegistration: _validateRegistration,
    validateRegisterMiddleware,
};
