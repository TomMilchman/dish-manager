const { TagDefinitions } = require("../constants/tagDefinitions");
const { COLOR_MAP } = require("../constants/colorMap");
const { logInfo } = require("../utils/logger");

/**
 * Retrieves all ingredient tags for the authenticated user and sends them in the response.
 *
 * @async
 * @function getAllTags
 * @param {import('express').Request} req - Express request object, containing the authenticated user's information.
 * @param {import('express').Response} res - Express response object, used to send the tags as a JSON response.
 * @returns {Promise<void>} Sends a JSON response with an array of ingredient tags.
 */
function getAllTags(req, res) {
    const { userId } = req.user;
    logInfo("get all tags", `Obtained ingredient tags for user ID ${userId}`);
    res.status(200).json({ tags: TagDefinitions.map(({ tag }) => tag) });
}

function getColorMap(req, res) {
    const { userId } = req.user;
    logInfo("get color map", `Obtained color map for user ID ${userId}`);
    res.status(200).json({ colorMap: COLOR_MAP });
}

module.exports = {
    getAllTags,
    getColorMap,
};
