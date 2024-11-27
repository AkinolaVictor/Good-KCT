module.exports = async function updateClipRank({models, which, feedRef}) {
    const {clipRanks} = models
    const {postID} = feedRef

    const bubbleData = await clipRanks.findOne({postID}).lean()
    if(bubbleData) {
        const engagements = {...bubbleData.engagements}
        
        if(engagements[which]){
            engagements[which]++
        } else {
            engagements[which] = 1
        }

        const lastengaged = new Date().toISOString()
        await clipRanks.updateOne({postID}, {engagements, lastengaged})
    }
}