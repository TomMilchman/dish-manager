const Joi = require("joi");
const { requiredStringRule } = require("./sharedSchemas");

//RULES--------------------------------------------------------------------

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 25;

const usernameRule = Joi.string()
    .alphanum()
    .min(USERNAME_MIN_LENGTH)
    .max(USERNAME_MAX_LENGTH);

const passwordRule = Joi.string()
    .min(PASSWORD_MIN_LENGTH)
    .max(PASSWORD_MAX_LENGTH)
    .required();

const emailRule = Joi.string().email();

const rememberMeRule = Joi.bool().required();

//SCHEMAS---------------------------------------------------------------

exports.registerSchema = Joi.object({
    username: usernameRule.required(),
    email: emailRule.required(),
    password: passwordRule,
    rememberMe: rememberMeRule,
});

exports.loginSchema = Joi.object({
    usernameOrEmail: Joi.alternatives().try(usernameRule, emailRule).required(),
    password: passwordRule,
    rememberMe: rememberMeRule,
});

exports.logoutSchema = Joi.object({
    userId: requiredStringRule,
});

exports.refreshSchema = Joi.object({
    refreshToken: requiredStringRule,
});

exports.forgotPasswordSchema = Joi.object({
    email: emailRule.required(),
});

exports.resetPasswordSchema = Joi.object({
    email: emailRule.required(),
    resetToken: requiredStringRule,
    password: passwordRule.required(),
});
