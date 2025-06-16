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
    const { error } = registerSchema.validate({
        username,
        email,
        password,
        rememberMe,
    });
    return error
        ? { success: false, error: error.details[0].message }
        : { success: true };
};

const validateRegisterMiddleware = (req, res, next) => {
    const result = _validateRegistration(
        req.body.username,
        req.body.email,
        req.body.password,
        req.body.rememberMe
    );

    if (!result.success) {
        return res.status(400).json({ message: result.error });
    }

    next();
};

module.exports = {
    validateRegistration: _validateRegistration,
    validateRegisterMiddleware,
};
