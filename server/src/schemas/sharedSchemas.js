const Joi = require("joi");

exports.requiredStringRule = Joi.string().required();

exports.userIdAndRoleSchema = Joi.object({
    userId: this.requiredStringRule,
    role: Joi.string().valid("user", "admin").required(),
});
