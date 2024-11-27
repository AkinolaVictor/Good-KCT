// const checkAiFollowerFollowingRatio = require("./checkAiFollowerFollowingRatio")
// const checkAiFollowers = require("./checkAiFollowers")
// const checkAiFollowings = require("./checkAIFollowings")
// const checkForEngagementTendency = require("./checkForEngagementTendency")
// const checkForLastContent = require("./checkForLastContent")
const eachOptionChecker = require("./eachOptionChecker")

async function fixedAIAudience({options, models, userID, creatorID, content, feed}) {
    const opts = [...options]
    let subApproved = false
    for(let i=0; i<opts.length; i++){
        const curr = opts[i]
        const value = curr.value.split("-")
        const num = value[0]||0
        const val = value[1]
        const dir = value[2]
        

        const result = await eachOptionChecker({num, dir, current: curr, val, models, userID, content, creatorID, feed})
        subApproved = subApproved || result
    }

    return {
        subApproved
    }
}

module.exports = fixedAIAudience