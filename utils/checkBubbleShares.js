
function checkBubbleShares({thisBubble, userID}){
    if(!thisBubble) return false
    const bubbleActivities = thisBubble?.activities?.iAmOnTheseFeeds||{}
    if(bubbleActivities[userID]){
        const userActivity = bubbleActivities[userID].myActivities
        if(userActivity.shared || thisBubble.user.id===userID){
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

module.exports = checkBubbleShares