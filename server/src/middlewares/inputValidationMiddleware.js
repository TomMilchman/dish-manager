const logger = require("../utils/logger");

function validatePart(schema, part = "body") {
    return (req, res, next) => {
        logger.log("validation middleware", `Validating ${part}`);

        const { error } = schema.validate(req[part], {
            abortEarly: true,
        });

        if (error) {
            const errorMessage = error.details[0].message;

            logger.logError(
                "validation middleware",
                `Validation failed: ${errorMessage}`
            );

            return res.status(400).json({ message: errorMessage });
        }

        next();
    };
}

module.exports = {
    validatePart,
};
