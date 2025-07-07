// Lower numbers are higher priority
const TagDefinitions = [
    { tag: "meat", conflicts: ["vegan", "vegetarian"], priority: 1 },
    { tag: "dairy", conflicts: ["vegan"], priority: 2 },
    { tag: "vegetarian", conflicts: ["meat"], priority: 2 },
    { tag: "vegan", conflicts: ["meat", "dairy"], priority: 3 },
];

module.exports = {
    TagDefinitions,
};
