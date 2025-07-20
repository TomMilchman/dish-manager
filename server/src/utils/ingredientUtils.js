exports.getPriceField = (unitType, price) => {
    let priceField;

    switch (unitType) {
        case "unit":
            priceField = { pricePerUnit: price };
            break;
        case "gram":
            priceField = { pricePer100g: price };
            break;
        case "liter":
            priceField = { pricePerLiter: price };
    }

    return priceField;
};
