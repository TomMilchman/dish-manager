const Joi = require("joi");
const { requiredStringRule } = require("./sharedSchemas");
const { Tags } = require("../constants/enums");

const tagArraySchema = Joi.string().valid(...Object.values(Tags));

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
    tags: Joi.array().items(tagArraySchema),
    // TODO: add tags to ingredient creation process
});

exports.ingredientIdSchema = Joi.object({
    ingredientId: requiredStringRule,
});

exports.updateIngredientSchema = Joi.object({
    updates: Joi.object().min(1).required(),
});
