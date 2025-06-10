import Joi from "joi";

const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().min(6).required(),
});
