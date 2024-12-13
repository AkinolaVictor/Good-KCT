const checkIfEngagedinLastBubble = require("./audienceComp/checkIfEngagedinLastBubble")
const checkIfEngagedinLastClip = require("./audienceComp/checkIfEngagedinLastClip")
const getDateGap = require("./getDateGap")

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

async function checkForLastContent({userID, creatorID, content, models, feed}) {
    if(content==="bubble"){
        const checkInBubble = await checkIfEngagedinLastBubble({creatorID, userID, models, feed})
        return checkInBubble
    }

    if(content==="clip"){
        const checkInBubble = await checkIfEngagedinLastClip({creatorID, userID, models, feed})
        return checkInBubble
    }

    return false
}

async function checkForEngagementTendency({userID, feed, models}) {
    const {userKnowledgebase} = models
    const hashTags = feed?.metaData?.hash||{}
    const hashArr = Object.keys(hashTags)
    let pass = false

    if(hashArr.length){
        const userBase = await userKnowledgebase.findOne({userID}).lean()
        if(userBase){
            const engagements = userBase?.hashTags
            for(let i=0; i<hashArr.length; i++){
                const eachHash = hashArr[i]
                const gotten = engagements[eachHash]

                if(gotten){
                    // const {likes, replys, lastdate, openedAnalytics, openedReplys, shares} = gotten
                    const {likes, replys, lastdate, shares} = gotten
                    const now = new Date().toISOString()
                    const gap = getDateGap(now, lastdate)

                    const timeSpace = 4*7*24*60*60*1000
                    const tendency = likes || replys || shares
                    const gapPass = gap<=timeSpace
                    if(gapPass && tendency){
                        pass = true
                        break
                    }
                }
            }
        }
    }

    return pass
}

async function checkHandpicked({current, userID}){
    const data = current?.data||[]
    if(data.includes(userID)){
        return true
    }
    return false
}


const exportdata = {
    checkAiFollowers,
    checkAiFollowings,
    checkAiFollowerFollowingRatio,
    checkForLastContent,
    checkForEngagementTendency,
    checkHandpicked
}

module.exports = exportdata