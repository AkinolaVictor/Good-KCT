function checkClipShares({clip, userID}){
    if(!clip) return false
    if(!userID) return false
    
    const clipShares = clip?.allShares||[]
    const ifShare = clipShares.includes(userID)
    return ifShare
}

module.exports = checkClipShares