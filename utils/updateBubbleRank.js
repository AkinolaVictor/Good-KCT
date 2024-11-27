module.exports = async function updateBubbleRank({models, which, feedRef}) {
    const {bubbleRanks} = models
    const {postID} = feedRef

    const bubbleData = await bubbleRanks.findOne({postID}).lean()
    if(bubbleData) {
        const engagements = {...bubbleData.engagements}
        
        if(engagements[which]){
            engagements[which]++
        } else {
            engagements[which] = 1
        }

        const lastengaged = new Date().toISOString()
        await bubbleRanks.updateOne({postID}, {engagements, lastengaged})
    }
}