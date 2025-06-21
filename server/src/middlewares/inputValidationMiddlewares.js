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

    const { error } = registerSchema.validate(inputData);

    if (error) {
        return { success: false, error: error.details[0].message };
    }

    return { success: true };
};

const validateRegisterMiddleware = (req, res, next) => {
    const result = _validateRegistration(
        req.body.username,
        req.body.email,
        req.body.password,
        req.body.rememberMe
    );

    if (!result.success) {
        console.log("[VALIDATION MIDDLEWARE] Validation failed:", result.error);
        return res.status(400).json({ message: result.error });
    }

    console.log("[VALIDATION MIDDLEWARE] Validation succeeded");
    next();
};

const validateNoEmptyBodyParamsMiddleware = (req, res, next) => {
    const keys = Object.keys(req.body);

    const missingKey = keys.find(
        (key) =>
            req.body[key] === undefined ||
            req.body[key] === null ||
            req.body[key] === ""
    );

    if (missingKey) {
        return res
            .status(400)
            .json({ message: `Missing input: ${missingKey}` });
    }

    next();
};

module.exports = {
    validateRegistration: _validateRegistration,
    validateRegisterMiddleware,
    validateNoEmptyBodyParamsMiddleware,
};
