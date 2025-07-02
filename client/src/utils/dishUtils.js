export const getPriceForIngredient = (ingredient) => {
    const priceMap = {
        unit: ingredient.pricePerUnit,
        gram: ingredient.pricePer100g,
        liter: ingredient.pricePerLiter,
    };

    return priceMap[ingredient.unitType] ?? 0;
};
