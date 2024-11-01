const checkAiFollowerFollowingRatio = require("./checkAiFollowerFollowingRatio")
const checkAiFollowers = require("./checkAiFollowers")
const checkAiFollowings = require("./checkAIFollowings")
const checkForEngagementTendency = require("./checkForEngagementTendency")
const checkForLastContent = require("./checkForLastContent")
const eachOptionChecker = require("./eachOptionChecker")

async function fixedAIAudience({options, models, userID, creatorID, content, feed}) {
    const opts = [...options]
    let subApproved = false
    for(let i=0; i<opts.length; i++){
        const curr = opts[i].split("-")
        const num = curr[0]||0
        const val = curr[1]
        const dir = curr[2]
        

        const result = await eachOptionChecker({num, dir, val, models, userID, content, creatorID, feed})
        subApproved = subApproved || result

        // if(val === "ffw"){
        //     const result = await checkAiFollowers({userID, num, dir, models})
        //     subApproved = subApproved || result
        // }

        // if(val === "ffg"){
        //     const result = await checkAiFollowings({userID, num, dir, models})
        //     subApproved = subApproved || result
        // }

        // if(val === "ffr"){
        //     const result = await checkAiFollowerFollowingRatio({userID, num, dir, models})
        //     subApproved = subApproved || result
        // }

        // if(val === "rlp"){
        //     const result = await checkForLastContent({userID, num, dir, creatorID, content, models})
        //     subApproved = subApproved || result
        // }

        // if(val === "eng"){
        //     const result = await checkForEngagementTendency({userID, feed, models})
        //     subApproved = subApproved || result
        // }
    }

    return {
        subApproved
    }
}

module.exports = fixedAIAudience