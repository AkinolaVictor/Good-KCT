function checkBubbleLikes({thisBubble, userID}){
    if(!thisBubble) return false
    const likes = thisBubble?.like||[]
    return likes.includes(userID)
}

module.exports = checkBubbleLikes