const { dataType } = require("../../utils/utilsExport")

async function bubbleServer(req, res){
    const {userID, seen, where, count} = req.body
    const {bubblesForEveryone, Feeds, Following, userBubbles} = req.dbModels

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

                    if(!tracker.includes(postID)){
                        tracker.push(postID)
                    }

                    const basicViewEligibity = audience["Everyone"] || audience[userID] || Object.keys(audience).length===0
                    const bubbleIsAos = aos!=="None"

                    // console.log(audience);
                    if(basicViewEligibity){
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

                    if(stored.length>=count){
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