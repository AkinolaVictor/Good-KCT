const Ai_Audience = require("./AIAudience")
const clipRankModel = require("./clipRankModel")
const dataType = require("./dataType")

module.exports = async function getRandomClips({clipRefs, models, userID, seen, where, count}) {
    const {cinema, userKnowledgebase, hashTags} = models
    const tracker = []
    const familiar = []

    const contentHashs = await hashTags.findOne({title: "batch_1"}).lean()
    const userKnowledge = await userKnowledgebase.findOne({userID}).lean()

    const refIDs = []
    for(let i=0; i<interestBasedContents.length; i++){
        const curr = interestBasedContents[i]
        const {postID} = curr
        refIDs.push(postID)
    }

    
    if(clipRefs.length){
        for(let i=0; i<clipRefs.length; i++){
            const curr = clipRefs[i]
            if(dataType(curr) !== "object") continue

            const {postID, metaData} = curr||{}
            const {audience, aos} = metaData
            const hash = metaData?.hash||{}

            
            // post ranking here
            const {state} = await clipRankModel({feedRef: curr, userID, models, contentHashs, userKnowledge})
            if(state === "bad") continue

            if(!tracker.includes(postID)){
                tracker.push(postID)
            } else {
                continue
            }

            const basicViewEligibity = audience["Everyone"] || audience[userID] || Object.keys(audience).length===0
            const clipIsAos = aos!=="None"
            const aiAud = audience["Ai Audience"]
            const aiAud2 = audience["Ai Audience"]||{}
            const audArr = Object.values(aiAud2)
            if(aiAud && !basicViewEligibity){
                let confirm = true
                for(let i=0; i<audArr.length; i++){
                    const each = audArr[i]
                    const {approved} = await Ai_Audience({
                        userID,
                        models,
                        audienceData: each,
                        content: "clip",
                        feed: curr
                    })
                    
                    if(approved){
                        confirm = false
                        break
                    }
                }

                if(confirm){
                    continue
                }
            }

            const clipChecker = await cinema.findOne({postID})
            if(!clipChecker) continue

            if(basicViewEligibity || aiAud){
                if(!seen.includes(postID)){
                    if(where==="aos"){
                        if(clipIsAos){
                            familiar.push(curr)
                        }
                    } else {
                        familiar.push(curr)
                    }
                }
            }

            if(familiar.length>=count){
                break
            }
        }
    }
    return familiar
}