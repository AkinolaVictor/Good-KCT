const { dataType } = require("../utilsExport")

async function checkIfEngagedinLastBubble({creatorID, userID, models}){
    const {userBubbles, bubble} = models
    let pass = false
    const userContent = await userBubbles.findOne({userID: creatorID}).lean()
    if(userContent){
        const bubbles = [...userContent.bubbles]
        const last = bubbles[bubbles.length-1]
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