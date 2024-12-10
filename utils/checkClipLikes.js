function checkClipLikes({clip, userID}){
    if(!clip) return false
    if(!userID) return false

    const data = clip?.data||[]
    for(let i=0; i<data.length; i++){
        const likes = data[i]?.likes||{}
        if(likes[userID]) return true
    }
    return false
}

module.exports = checkClipLikes