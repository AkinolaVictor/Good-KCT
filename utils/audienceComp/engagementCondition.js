const conditionBubbleEngagement = require("./conditionBubbleEngagement")
const conditionClipEngagement = require("./conditionClipEngagement")

async function engagementCondition({feed, num, dir, content, models}) {
    if(content === "bubble"){
        const result = await conditionBubbleEngagement({models, feed, num, dir})
        return result
    }

    if(content === "clip"){
        const result = await conditionClipEngagement({models, feed, num, dir})
        return result
    }

    return false
}

module.exports = engagementCondition