
async function conditionClipEngagement({models, feed, num, dir}) {
    const {postID} = feed
    let pass = false
    const {cinema, cinemaPair} = models
    const  thisCinema = await cinema.findOne({postID}).lean()
    const thisCinemaPair = await cinemaPair.findOne({postID}).lean()
    if(thisCinema && thisCinemaPair){
        const thisClip = {...thisCinema, ...thisCinemaPair}
        const data = thisClip.data
        
        let totLike = 0
        let totRep = 0
        for(let i=0;i<data.length; i++){
            const curr = data[i]
            const likes = curr.likes||{}
            const likesCounta = Object.keys(likes).length
            totLike+=likesCounta
            totLike+=curr.likeCount
            totRep+=curr.replyCount
        }
        
        const count = dir==="lk"?totLike:totRep
        const result = count>=num
        pass = result
    }
    return pass
}

module.exports = conditionClipEngagement