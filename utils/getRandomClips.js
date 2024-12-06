const Ai_Audience = require("./AIAudience")
const clipRankModel = require("./clipRankModel")
const dataType = require("./dataType")

module.exports = async function getRandomClips({clipRefs, models, interestBasedContents, userID, seen, where, count}) {
    const {User, userKnowledgebase, hashTags, clipRanks} = models
    const tracker = []
    const familiar = []

    const contentHashs = await hashTags.findOne({title: "batch_1"}).lean()
    const userKnowledge = await userKnowledgebase.findOne({userID}).lean()

    const refIDs = []
    for(let i=0; i<interestBasedContents.length; i++){
        const curr = interestBasedContents[i]
        const {postID} = curr||{}
        refIDs.push(postID)
    }

    let cacheUser = null

    
    if(clipRefs.length){
        for(let i=0; i<clipRefs.length; i++){
            const curr = clipRefs[i]
            if(dataType(curr) !== "object") continue

            const {postID, metaData} = curr||{}
            const {aos, audience, loc, gend} = metaData||{aos:"None"}
            // const hash = metaData?.hash||{}
            
            // post ranking here
            if(tracker.includes(postID)) continue
            if(seen.includes(postID)) continue
            if(refIDs.includes(postID)) continue
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
                    if(gend !== thisGender) continue
                }
            }


            const {state} = await clipRankModel({feedRef: curr, userID, models, contentHashs, userKnowledge})
            if(state === "bad") continue

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

            // const clipChecker = await cinema.findOne({postID})
            const clipChecker = await clipRanks.findOne({postID})
            if(!clipChecker) continue

            if(basicViewEligibity || aiAud){
                if(where==="aos"){
                    if(clipIsAos){
                        familiar.push(curr)
                    }
                } else {
                    familiar.push(curr)
                }
            }

            if(familiar.length>=count){
                break
            }
        }
    }
    return familiar
}