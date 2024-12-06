const Ai_Audience = require("./AIAudience")
const dataType = require("./dataType")

async function getReservedContents({models, which, userID, seen, interestBasedContents, where, count}) {
    const {reservedContents, bubbleRanks, clipRanks} = models
    // const stored = []
    const tracker = []
    const familiar = []
    
    const reserved = await reservedContents.findOne({userID}).lean()
    if(!reserved) return familiar

    const current = which==="bubble"?"bubbles":"cinema"
    const whichRanks = which==="bubble"?bubbleRanks:clipRanks
    const thisData = reserved[current]

    if(!thisData) return familiar

    const refIDs = []
    for(let i=0; i<interestBasedContents.length; i++){
        const curr = interestBasedContents[i]
        const {postID} = curr||{}
        refIDs.push(postID)
    }
    
    for(let i=0; i<thisData.length; i++){
        const curr = thisData[i]
        if(dataType(curr) !== "object") continue

        const {postID, metaData} = current||{}
        const {aos} = metaData||{aos:"None"}
        const audience = metaData?.audience||{}

        if(refIDs.includes(postID)) continue
        if(seen.includes(postID)) continue
        if(tracker.includes(postID)) continue
        
        tracker.push(postID)

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
                    content: which,
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
                
        // const bubbleChecker = await bubble.findOne({postID})
        const bubbleChecker = await whichRanks.findOne({postID})
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

    return familiar
}

module.exports = getReservedContents