const Ai_Audience = require("./AIAudience")
const bubbleRankModel = require("./bubbleRankModel")
const dataType = require("./dataType")

async function getInterestBasedBubbles({models, bubbleRefs, interestsKnowledge, userID, seen, where, count}) {
    const {bubbleRanks, hashTags, userKnowledgebase, User} = models
    const tracker = []
    const familiar = []

    const contentHashs = await hashTags.findOne({title: "batch_1"}).lean()
    const userKnowledge = await userKnowledgebase.findOne({userID}).lean()

    let cacheUser = null
    
    if(bubbleRefs.length){
        for(let i=0; i<bubbleRefs.length; i++){
            const current = bubbleRefs[i]
            
            if(dataType(current) !== "object") continue
            
            const {postID, metaData} = current||{}
            const {aos, loc, gend} = metaData||{aos:"None"}
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

            
            if(count_x === 0) continue
            if(seen.includes(postID)) continue
            if(tracker.includes(postID)) continue
            tracker.push(postID)

            if(loc){
                if(!cacheUser) cacheUser = await User.findOne({id: userID}).lean()
                if(cacheUser){
                    const {location} = cacheUser?.userInfo
                    const loco = location?.country?.toLowerCase()
                    if(!loc.includes(loco)) continue
                }
            }

            if(gend){
                if(!cacheUser) cacheUser = await User.findOne({id: userID}).lean()
                if(cacheUser){
                    const {gender} = cacheUser?.userInfo
                    const thisGender = gender==="male"?"m":gender==="female"?"f":"a"
                    if(gend!==thisGender) continue
                }
            }

            
            const {state} = await bubbleRankModel({feedRef: current, userID, models, contentHashs, userKnowledge})
            if(state === "bad" || state === "fair") continue

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

            const bubbleChecker = await bubbleRanks.findOne({postID})
            if(!bubbleChecker) continue
            
            if(aiAud || basicViewEligibity){
                if(where==="aos"){
                    if(bubbleIsAos){
                        familiar.push(current)
                    }
                } else {
                    familiar.push(current)
                }
            }

            if(familiar.length>=count){
                break
            }
            
        }
    }

    return familiar
}   

module.exports = getInterestBasedBubbles