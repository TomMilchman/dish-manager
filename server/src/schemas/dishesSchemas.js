const Joi = require("joi");
const { requiredStringRule } = require("./sharedSchemas");
const { Colors } = require("../constants/enums");

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
    isFavorite: Joi.boolean(),
    cardColor: Joi.string().valid(...Object.values(Colors)),
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
