const Joi = require("joi");
const logger = require("../utils/logger");

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

const validateRegisterMiddleware = (req, res, next) => {
    const { error } = registerSchema.validate(req.body, { abortEarly: false });

    if (error) {
        logger.logError(
            "validation middleware",
            `Validation failed: ${error.details}`
        );
        const messages = error.details
            .map((detail) => detail.message)
            .join(", ");
        return res.status(400).json({ message: messages });
    }

    logger.logInfo("validation middleware", "Validation succeeded");
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
    validateRegisterMiddleware,
    validateNoEmptyBodyParamsMiddleware,
};
