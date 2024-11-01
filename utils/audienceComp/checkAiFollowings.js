async function checkAiFollowings({userID, num, dir, models}) {
    const {Following} = models
    const followingData = await Following.findOne({userID}).lean()
    if(followingData){
        const count = Object.keys({...followingData?.following}).length||0
        const m = count > Number(num)
        const l = count < Number(num)
        const result = dir==="m"?m:l
        // subApproved = subApproved || result
        return result
    }
    return false
}

module.exports = checkAiFollowings