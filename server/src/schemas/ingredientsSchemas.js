const Joi = require("joi");
const { TagDefinitions } = require("../constants/tagDefinitions");
const { requiredStringRule } = require("./sharedSchemas");

const tagArraySchema = Joi.string().valid(
    ...TagDefinitions.map(({ tag }) => tag)
);

const tagsSchema = Joi.array().items(tagArraySchema).default([]);

const baseIngredientFields = {
    name: requiredStringRule,
    unitType: Joi.string().valid("unit", "gram", "liter"),
    price: Joi.number().min(1),
    imageUrl: Joi.string().allow(""),
    tags: tagsSchema,
};

exports.createIngredientSchema = Joi.object({
    ...baseIngredientFields,
    unitType: baseIngredientFields.unitType.required(),
    price: baseIngredientFields.price.required(),
});

exports.ingredientIdSchema = Joi.object({
    ingredientId: requiredStringRule,
});

exports.updateIngredientSchema = Joi.object(baseIngredientFields)
    .min(1)
    .required();
