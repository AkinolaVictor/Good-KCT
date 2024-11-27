const checkAiFollowerFollowingRatio = require("./checkAiFollowerFollowingRatio")
const checkAiFollowers = require("./checkAiFollowers")
const checkAiFollowings = require("./checkAIFollowings")
const checkForEngagementTendency = require("./checkForEngagementTendency")
const checkForLastContent = require("./checkForLastContent")
const checkHandpicked = require("./checkHandpicked")


async function eachOptionChecker({userID, num, dir, current, creatorID, content, models, feed, val}){
    let finalResult = false
    
    if(val === "ffw"){
        const result = await checkAiFollowers({userID, num, dir, models})
        finalResult = result
    }

    if(val === "ffg"){
        const result = await checkAiFollowings({userID, num, dir, models})
        finalResult = result
    }

    if(val === "ffr"){
        const result = await checkAiFollowerFollowingRatio({userID, num, dir, models})
        finalResult = result
    }

    if(val === "rlp"){
        const result = await checkForLastContent({userID, num, dir, creatorID, content, models, feed})
        finalResult = result
    }

    if(val === "eng"){
        const result = await checkForEngagementTendency({userID, feed, models})
        finalResult = result
    }

    if(val === "hnp"){
        const result = await checkHandpicked({current, userID})
        finalResult = result
    }

    if(val === "ebs"){
        const result = true
        finalResult = result
    }
    
    return finalResult
}

module.exports = eachOptionChecker