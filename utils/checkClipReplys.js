function checkClipReplys({clip, userID}){
    if(!clip) return false
    if(!userID) return false

    const reps = clip?.allReplys||{}
    const repsArr = Object.values(reps)
    for(let i=0; i<repsArr.length; i++){
        const curr = repsArr[i]
        if(typeof curr === "object"){
            const creatorID = curr.userID
            if(userID === creatorID){
                return true
            }
        }
    }

    return false
}

module.exports = checkClipReplys