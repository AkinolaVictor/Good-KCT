async function checkAiFollowerFollowingRatio({userID, num, dir, models}) {
    const {Followers, Following} = models
    const followersData = await Followers.findOne({userID}).lean()
    const followingData = await Following.findOne({userID}).lean()
    if(followingData && followersData){
        const FFwCount = Object.keys({...followersData?.followers}).length||0
        const FFlCount = Object.keys({...followingData?.following}).length||0
        const ratio = FFwCount/FFlCount
        const m = ratio > Number(num)
        const l = ratio < Number(num)
        const result = dir==="m"?m:l
        return result
    }
    return false
}

module.exports = checkAiFollowerFollowingRatio