const checkIfEngagedinLastBubble = require("./checkIfEngagedinLastBubble")
const checkIfEngagedinLastClip = require("./checkIfEngagedinLastClip")

async function checkForLastContent({userID, creatorID, content, models}) {
    if(content==="bubble"){
        const checkInBubble = await checkIfEngagedinLastBubble({creatorID, userID, models})
        return checkInBubble
    }

    if(content==="clip"){
        const checkInBubble = await checkIfEngagedinLastClip({creatorID, userID, models})
        return checkInBubble
    }

    return false
}

module.exports = checkForLastContent