const Ai_Audience = require("../../utils/AIAudience")
const { dataType } = require("../../utils/utilsExport")

async function bubbleServer(req, res){
    const {userID, seen, where, count, location} = req.body
    const {bubblesForEveryone, Feeds, Following, userBubbles, bubble,} = req.dbModels

    try {
        
        let bubbleRefs = []
        if(where==="for all"){
            const generalBubble = await bubblesForEveryone.findOne({name: "Everyone"}).lean()
            const genRefs = [...generalBubble.bubbleRefs].reverse()
            if(generalBubble) bubbleRefs = [...bubbleRefs, ...genRefs]
        }
        
        if(where==="following"){
            const userFeed = await Feeds.findOne({userID}).lean()
            const userFeedRefs = [...userFeed.bubbles].reverse()
            if(userFeed) bubbleRefs=[...bubbleRefs, ...userFeedRefs]
        }
        
        if(where==="aos"){
            const generalBubble = await bubblesForEveryone.findOne({name: "Everyone"}).lean()
            const genRefs = [...generalBubble.bubbleRefs].reverse()
            if(generalBubble) bubbleRefs = [...bubbleRefs, ...genRefs]

            const userFeed = await Feeds.findOne({userID}).lean()
            const userFeedRefs = [...userFeed.bubbles].reverse()
            if(userFeed) bubbleRefs = [...bubbleRefs, ...userFeedRefs]
        }

        const stored = []
        const tracker = []
        if(bubbleRefs.length){
            for(let i=0; i<bubbleRefs.length; i++){
                const current = bubbleRefs[i]
                if(dataType(current)==="object"){
                    const {postID, metaData} = current||{}
                    const {aos} = metaData||{aos:"None"}
                    const audience = metaData?.audience||{}

                    const bubbleChecker = await bubble.findOne({postID})
                    if(!bubbleChecker) continue

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
                                models: req.dbModels,
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

                    
                    if(aiAud || basicViewEligibity){
                        if(!seen.includes(postID)){
                            if(where==="aos"){
                                if(bubbleIsAos){
                                    stored.push(current)
                                }
                            } else {
                                stored.push(current)
                            }
                        }
                    }

                    // if(stored.length>=count){
                    if(stored.length>=60){
                        break
                    }
                }
            }
        }
        res.send({successful: true, bubbles: stored})
    } catch(e){
        console.log(e);
        console.log("some error ");
        res.send({successful: false, message: "some error encountered at the server side"})
    }
}

module.exports = bubbleServer