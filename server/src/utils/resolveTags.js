const { TagDefinitions } = require("../constants/tagDefinitions"); /**

/* Resolves conflicts between tags in a given set based on predefined priorities.
 *
 * Iterates through a set of tags and removes conflicting tags according to
 * their priority levels defined in TagDefinitions. If two tags conflict, the
 * tag with the lower priority value is retained.
 *
 * @param {Set<string>} tagSet - A set of tags to be resolved.
 * @returns {string[]} - An array of resolved tags with conflicts removed.
 */
exports.resolveTags = (tagSet) => {
    const tagPriorityMap = Object.fromEntries(
        TagDefinitions.map(({ tag, priority }) => [tag, priority])
    );

    for (const { tag, conflicts } of TagDefinitions) {
        if (!tagSet.has(tag)) continue;

        for (const conflictTag of conflicts) {
            if (tagSet.has(conflictTag)) {
                const keepTag =
                    tagPriorityMap[tag] <= tagPriorityMap[conflictTag]
                        ? tag
                        : conflictTag;
                const removeTag = keepTag === tag ? conflictTag : tag;

                tagSet.delete(removeTag);
            }
        }
    }

    return [...tagSet];
};
