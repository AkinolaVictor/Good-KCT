const checkIfEngagedinLastBubble = require("./checkIfEngagedinLastBubble")
const checkIfEngagedinLastClip = require("./checkIfEngagedinLastClip")

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

module.exports = checkForLastContent