import Joi from "joi";

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

const registerSchema = Joi.object({
    username: usernameRule,
    email: Joi.string().email().required(),
    password: passwordRule,
});

const loginSchema = Joi.object({
    username: usernameRule,
    password: passwordRule,
});

// TODO: Figure out if I should move validate functionality outside of the HTTP request handler (perhaps use a decorator pattern?)

exports.validateRegister = (req, res, next) => {
    const { error } = registerSchema.validate(req.body);

    if (error)
        return res.status(400).json({ message: error.details[0].message });

    next();
};

exports.validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);

    if (error)
        return res.status(400).json({ message: error.details[0].message });

    next();
};
