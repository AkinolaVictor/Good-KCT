const propagatorAlgorithm = require("../../utils/algorithms/propagatorAlgorithm")
const knowledgeBuilder = require("../../utils/knowledgeBuilder")
const knowledgeTypes = require("../../utils/knowledgeTypes")

async function openedClipReply(req, res) {
    const {feedRef, userID, algorithmInfo} = req.body
    const {hash} = feedRef?.metaData || {hash: {}}

    try {
        await knowledgeBuilder({userID, models: req.dbModels, which: knowledgeTypes.openedReply, intent: "hashtags", hash: [...Object.keys(hash)]})
        
        if(algorithmInfo){
            const {triggeredEvent, algoType, contentType, algorithm} = algorithmInfo
            await propagatorAlgorithm({
                models: req.dbModels, 
                feedRef,
                contentType, 
                algoType, 
                triggeredEvent,
                algorithm
            })
        }
        res.send({successful: true})
    } catch(e){
        res.send({successful: true})
    }
}

module.exports = openedClipReply