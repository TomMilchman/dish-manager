const Joi = require("joi");
const { requiredStringRule } = require("./sharedSchemas");

const dishNameRule = Joi.string().max(24);

const ingredientsArraySchema = Joi.object({
    ingredient: requiredStringRule,
    amount: Joi.number().required(),
});

const ingredientsArrayRule = Joi.array()
    .items(ingredientsArraySchema)
    .required()
    .unique("ingredient");

exports.createUserDishSchema = Joi.object({
    name: dishNameRule.required(),
    ingredients: ingredientsArrayRule.required(),
});

exports.updateDishSchema = Joi.object({
    name: dishNameRule,
    ingredients: ingredientsArrayRule,
})
    .or("name", "ingredients")
    .min(1);

exports.dishIdSchema = Joi.object({
    dishId: requiredStringRule,
});
