const knowledgeBuilder = require("../../utils/knowledgeBuilder")

async function openedClipReply(req, res) {
    const {feedRef, userID} = req.body
    const {hash} = feedRef?.metaData || {hash: {}}
    await knowledgeBuilder({userID, models: req.dbModels, which: "openedReplys", intent: "hashtags", hash: [...Object.keys(hash)]})
    res.send({successful: true})
}

module.exports = openedClipReply