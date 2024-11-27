const knowledgeBuilder = require("../../utils/knowledgeBuilder")
const knowledgeTypes = require("../../utils/knowledgeTypes")

async function openedClipReply(req, res) {
    const {feedRef, userID} = req.body
    const {hash} = feedRef?.metaData || {hash: {}}
    await knowledgeBuilder({userID, models: req.dbModels, which: knowledgeTypes.openedReply, intent: "hashtags", hash: [...Object.keys(hash)]})
    res.send({successful: true})
}

module.exports = openedClipReply