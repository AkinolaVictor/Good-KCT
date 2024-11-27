const { dataType } = require("../utilsExport")

async function checkIfEngagedinLastBubble({creatorID, userID, models, feed}){
    const {userBubbles, bubble} = models
    let pass = false
    const userContent = await userBubbles.findOne({userID: creatorID}).lean()
    if(userContent){
        const bubbles = [...userContent.bubbles]
        let last = null

        for(let i=0; i<bubbles.length; i++){
            const curr = bubbles[i]
            const postID = curr?.postID
            if(postID === feed?.postID){
                const prev = bubbles[i-1]
                last = prev
            }
        }

        if(dataType(last) === "object"){
            const {postID} = last
            const thisBubble = await bubble.findOne({postID}).lean()
            if(thisBubble){
                if(typeof(thisBubble.activities) === "string"){
                    const activities = JSON.parse(thisBubble.activities)
                    thisBubble.activities = activities
                }
                
                if(thisBubble?.activities?.iAmOnTheseFeeds[userID]){
                    const myActivities = thisBubble?.activities?.iAmOnTheseFeeds[userID]?.myActivities || {}
                    // const checker = myActivities.liked || myActivities.replied || myActivities.shared
                    const checker = myActivities.replied
                    pass = checker
                }
            }
        }
    }
    return pass
}

module.exports = checkIfEngagedinLastBubble