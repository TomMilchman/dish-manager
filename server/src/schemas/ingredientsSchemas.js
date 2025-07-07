const Joi = require("joi");
const { TagDefinitions } = require("../constants/tagDefinitions");
const { requiredStringRule } = require("./sharedSchemas");

const tagArraySchema = Joi.string().valid(
    ...TagDefinitions.map(({ tag }) => tag)
);

const tagsSchema = Joi.array().items(tagArraySchema).default([]);

exports.createIngredientSchema = Joi.object({
    name: requiredStringRule,
    unitType: Joi.string().valid("unit", "gram", "liter").required(),
    pricePerUnit: Joi.number().when("unitType", {
        is: "unit",
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),
    pricePer100g: Joi.number().when("unitType", {
        is: "gram",
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),
    pricePerLiter: Joi.number().when("unitType", {
        is: "liter",
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),
    tags: tagsSchema,
});

exports.ingredientIdSchema = Joi.object({
    ingredientId: requiredStringRule,
});

exports.updateIngredientSchema = Joi.object({
    updates: Joi.object().min(1).required(),
});
