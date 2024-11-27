const knowledgeBuilder = require("../../utils/knowledgeBuilder")
const knowledgeTypes = require("../../utils/knowledgeTypes")
const updateClipRank = require("../../utils/updateClipRank")

async function clipImpression(req, res) {
    const {cinema} = req.dbModels
    const {feedRef, userID} = req.body

    const {postID} = feedRef
    const thisClip = await cinema.findOne({postID}).lean()
    if(thisClip){
        let impressions = thisClip.impressions
        if(impressions){
            impressions++
        } else {
            impressions = 1
        }

        const {metaData} = feedRef
        if(metaData){
            const hash = metaData.hash||{}

            await updateClipRank({which: "impressions",  models: req.dbModels, feedRef})
            await knowledgeBuilder({userID, models, which: knowledgeTypes.impression, intent: "hashtags", hash: [...Object.keys(hash)]})
        }
        await cinema.updateOne({postID}, {impressions})
    }

    res.send({successful: true})
}

module.exports = clipImpression