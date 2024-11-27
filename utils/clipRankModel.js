module.exports = async function clipRankModel({feedRef, userID, models, contentHashs, userKnowledge}) {
    const {clipRanks} = models
    const {postID} = feedRef
    const rank = await clipRanks.findOne({postID})
    const response = {
        state: "bad",
        score: 0,
        pass: false
    }

    return response
    
    // try{
    //     const response = { pass: false, score: 0, state: "bad" }
    //     const rankData = await bubbleRanks.findOne({postID}).lean()
        
    //     if(rankData){
    //         const {likes, shares, replys, impressions} = rankData?.engagements||{}
    //         const rankD = rankData?.metadata||{}
    //         const {text, image, video, created} = rankD
    //         const hashstack = rankD.hash||{}
    //         const hashs = Object.keys(hashstack)

    //         // Content Rank (MAX 40)
    //         let contentRankCount = 0
    //         if(video && image && text){
    //             contentRankCount = 40
    //         } else if((video && text) || (video && image)) {
    //             contentRankCount = 35
    //         } else if(video) {
    //             contentRankCount = 30
    //         } else if(text && image) {
    //             contentRankCount = 25
    //         } else if(image) {
    //             contentRankCount = 20
    //         } else if(text) {
    //             contentRankCount = 10
    //         }

    //         // Rank by topic (MAX 40)
    //         let topicRank = 0
    //         // const contentHashs = await hashTags.findOne({title: "batch_1"}).lean()
    //         if(contentHashs){
    //             const allHashs = contentHashs?.allHashs||{}
    //             const hashTrack = []
    //             for(let i=0; i<hashs.length; i++){
    //                 const curr = hashs[i]
    //                 const thisHash = allHashs[curr]?.count||{cin: 0, bub: 0}
    //                 const {cin, bub} = thisHash
    //                 const totalRet = cin+bub
    //                 hashTrack.push(totalRet)
    //             }
    //             const high = Math.max(...hashTrack)
    //             let totavg = 0
    //             for(let i=0; i<hashTrack.length; i++){
    //                 const curr = hashTrack[i]
    //                 totavg+=curr
    //             }
    //             const avg = totavg/hashTrack.length
    //             const rate = avg/high
    //             topicRank = rate*40
    //         }

    //         // Rank post by engagement (MAX 40)
    //         let engagementRank = 0
    //         let totalEngScore = Math.max(...[likes, shares, replys])
    //         const engConstant = totalEngScore/impressions
    //         engagementRank = engConstant*40

    //         // Decay Rank (MAX 40)
    //         let decayRank = 40
    //         const now = new Date().toISOString()
    //         const daygap = getDateGap(created, now, "day")
    //         if(daygap>=7){
    //             const thisShare = shares||1
    //             const thisReply = replys||1
    //             const thisLikes = likes||1
    //             const engMount = thisLikes*thisReply*thisShare
    //             const dayMount = daygap*86400000 // (24*60*60*1000) 
    //             const counter = engMount/dayMount
    //             if(counter<40){
    //                 decayRank = counter
    //             }
    //         }

    //         // const userKnowledge = await userKnowledgebase.findOne({userID}).lean()
    //         let trackHashInterestIndex = []
    //         let audienceScore = 0
    //         if(userKnowledge){
    //             const {hashTags} = userKnowledge
    //             for(let i=0; i<hashs.length; i++){
    //                 const curr = hashs[i]
    //                 const thisHash = hashTags[curr]
    //                 if(!thisHash) continue
    //                 const {like, share, reply, impression} = thisHash
    //                 const totalRet = Math.max(like, share, reply)
    //                 const hashIndex = totalRet/impression
    //                 trackHashInterestIndex.push(hashIndex)
    //             }

    //             const highestRate = trackHashInterestIndex.length?Math.max(...trackHashInterestIndex):0
    //             if(highestRate>=1){
    //                 audienceScore = 40
    //             } else {
    //                 audienceScore = highestRate*40
    //             }
    //             //  checkout to know the right pass mark
    //             //  if any/or/certain percentage if the weakest hashtag exist, 
    //         }

            
            
    //         const finalScore = contentRankCount + topicRank + engagementRank + decayRank + audienceScore
    //         response.pass = true
    //         response.score = finalScore
    //         if(finalScore>180){
    //             response.state = "good"
    //         } else if(finalScore>140){
    //             response.state = "moderate"
    //         } else if(finalScore>100){
    //             response.state = "fair"
    //         } else {
    //             response.state = "bad"
    //         }
    //     }

    //     return response
    // } catch (e) {
    //     return {pass: false, score: 0, state: "bad"}
    // }
}