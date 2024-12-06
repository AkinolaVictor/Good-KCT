const dataType = require("../../utils/dataType")
const knowledgeBuilder = require("../../utils/knowledgeBuilder")
const knowledgeTypes = require("../../utils/knowledgeTypes")
const updateClipRank = require("../../utils/updateClipRank")

async function clipImpression(req, res) {
    const {cinema, reservedContents} = req.dbModels
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

        await cinema.updateOne({postID}, {impressions})
        const {metaData} = feedRef
        if(metaData){
            const hash = metaData.hash||{}

            await updateClipRank({which: "impressions",  models: req.dbModels, feedRef})
            await knowledgeBuilder({userID, models: req.dbModels, which: knowledgeTypes.impression, intent: "hashtags", hash: [...Object.keys(hash)]})
        }

        
        const reserved = await reservedContents.findOne({userID}).lean()
        if(reserved){
            const cinemaa = reserved.cinema||[]
            for(let i=0; i<cinemaa.length; i++){
                const curr = cinemaa[i]
                if(dataType(curr) !== "object") continue
                const contentID = curr.postID
                if(postID === contentID){
                    cinemaa.splice(i, 1)
                }
            }
            await reservedContents.updateOne({userID}, {cinema: cinemaa})
        }
    }

    res.send({successful: true})
}

module.exports = clipImpression