const Ai_Audience = require("./AIAudience")
const bubbleRankModel = require("./bubbleRankModel")

async function getRandomBubbles({models, bubbleRefs, userID, seen, interestBasedContents, count, where}) {
    const {bubble, userKnowledgebase, hashTags} = models
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

    if(bubbleRefs.length){
        for(let i=0; i<bubbleRefs.length; i++){
            const current = bubbleRefs[i]
            if(dataType(current)==="object"){
                const {postID, metaData} = current||{}
                const {aos} = metaData||{aos:"None"}
                const audience = metaData?.audience||{}
                const hash = metaData?.hash||{}

                if(refIDs.includes(postID)) continue

                // get post's ranking here, but avoid it when in following section
                const {state} = await bubbleRankModel({feedRef: current, userID, models, contentHashs, userKnowledge})
                if(state === "bad") continue

                if(!tracker.includes(postID)){
                    tracker.push(postID)
                } else {
                    continue
                }

                const basicViewEligibity = audience["Everyone"] || audience[userID] || Object.keys(audience).length===0
                const bubbleIsAos = aos!=="None"
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
                            content: "bubble",
                            feed: current
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
                
                const bubbleChecker = await bubble.findOne({postID})
                if(!bubbleChecker) continue
                
                if(aiAud || basicViewEligibity){
                    if(!seen.includes(postID)){
                        if(where==="aos"){
                            if(bubbleIsAos){
                                familiar.push(current)
                            }
                        } else {
                            familiar.push(current)
                        }
                    }
                }

                if(familiar.length>=count){
                    break
                }
            }
        }


    }
    return familiar
}

module.exports = getRandomBubbles