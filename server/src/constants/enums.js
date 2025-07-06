const Tags = {
    MEAT: "meat",
    DAIRY: "dairy",
    VEGETARIAN: "vegetarian",
    VEGAN: "vegan",
};

const Colors = {
    YELLOW: "yellow",
    BAIGE: "baige",
    ORANGE: "orange",
    LIGHT_GREEN: "light_green",
    WHITE: "white",
};

Object.freeze(Tags);
Object.freeze(Colors);

module.exports = { Tags, Colors };
