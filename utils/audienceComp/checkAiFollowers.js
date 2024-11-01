async function checkAiFollowers({userID, num, dir, models}) {
    const {Followers} = models
    const followerData = await Followers.findOne({userID}).lean()
    
    if(followerData){
        const count = Object.keys({...followerData?.followers}).length||0
        const m = count > Number(num)
        const l = count < Number(num)
        const result = dir==="m"?m:l
        // subApproved = subApproved || result
        return result
    }
    return false
}

module.exports = checkAiFollowers