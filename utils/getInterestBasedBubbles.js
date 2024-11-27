const Ai_Audience = require("./AIAudience")
const bubbleRankModel = require("./bubbleRankModel")
const dataType = require("./dataType")

async function getInterestBasedBubbles({models, bubbleRefs, interestsKnowledge, userID, seen, where, count}) {
    const {bubble, hashTags, userKnowledgebase} = models
    const tracker = []
    const familiar = []

    const contentHashs = await hashTags.findOne({title: "batch_1"}).lean()
    const userKnowledge = await userKnowledgebase.findOne({userID}).lean()

    if(bubbleRefs.length){
        for(let i=0; i<bubbleRefs.length; i++){
            const current = bubbleRefs[i]
            if(dataType(current)==="object"){
                const {postID, metaData} = current||{}
                const {aos} = metaData||{aos:"None"}
                const audience = metaData?.audience||{}
                const hash = metaData?.hash||{}

                const allHashs = Object.keys(hash)
                let count_x = 0
                for(let j=0; j<allHashs.length; j++){
                    const each = allHashs[j]
                    if(interestsKnowledge[each]){
                        count_x = count_x+1
                    }
                }
                if(count_x===0) continue

                // check for post rank here
                // avoid this for following and for interested post
                const {state} = await bubbleRankModel({feedRef: current, userID, models, contentHashs, userKnowledge})
                if(state === "bad" || state === "fair") continue

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

module.exports = getInterestBasedBubbles