const Joi = require("joi");
const { requiredStringRule, tagsSchema } = require("./sharedSchemas");
const { COLOR_MAP } = require("../constants/colorMap");

const dishNameRule = Joi.string().max(24);

const ingredientsArraySchema = Joi.object({
    ingredient: requiredStringRule,
    amount: Joi.number().required(),
});

const ingredientsArrayRule = Joi.array()
    .items(ingredientsArraySchema)
    .required()
    .unique("ingredient");

const cardColorRule = Joi.string()
    .valid(...Object.keys(COLOR_MAP))
    .default("white");

exports.createUserDishSchema = Joi.object({
    name: dishNameRule.required(),
    ingredients: ingredientsArrayRule.required(),
    cardColor: cardColorRule,
});

exports.updateDishSchema = Joi.object({
    name: dishNameRule,
    ingredients: ingredientsArrayRule,
    cardColor: cardColorRule,
})
    .or("name", "ingredients")
    .min(1);

exports.dishIdSchema = Joi.object({
    dishId: requiredStringRule,
});
