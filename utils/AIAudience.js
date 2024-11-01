const dynamicAiAudience = require("./audienceComp/dynamicAiAudience")
const fixedAIAudience = require("./audienceComp/fixedAIAudience")
const progressiveAiAudience = require("./audienceComp/progressiveAiAudience")

async function Ai_Audience({models, audienceData, userID, content, feed}) {
    let approved = false 
    const AiAudience = audienceData?.AiAudience
    if(AiAudience){
        const {options, type} = AiAudience
        if(type === "fixed"){
            const {subApproved} = await fixedAIAudience({models, options, userID, content, feed})
            approved = subApproved
        }

        if(type === "dynamic"){
            const {subApproved} = await dynamicAiAudience({models, options, userID, content, feed})
            approved = subApproved
        }

        if(type === "progressive"){
            const {subApproved} = await progressiveAiAudience({models, options, userID, content, feed})
            approved = subApproved
        }
    }
    return {
        approved
    }
}

module.exports = Ai_Audience