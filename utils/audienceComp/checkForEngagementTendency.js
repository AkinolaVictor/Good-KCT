const getDateGap = require("../getDateGap")

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
                    const gap = getDateGap(lastdate, now)

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

module.exports = checkForEngagementTendency