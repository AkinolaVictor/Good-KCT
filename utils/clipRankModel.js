const getDateGap = require("./getDateGap")

module.exports = async function clipRankModel({feedRef, userID, models, contentHashs, userKnowledge}) {
    const {clipRanks} = models
    const {postID} = feedRef
    
    try{
        const response = { pass: false, score: 0, state: "bad" }
        const rankData = await clipRanks.findOne({postID}).lean()
        
        if(rankData){
            const {likes, shares, replys, impressions} = rankData?.engagements||{}
            const rankD = rankData?.metadata||{}
            const {text, image, video, created} = rankD
            const hashstack = rankD.hash||{}
            const hashs = Object.keys(hashstack)

            // Content Rank (MAX 40)
            let contentRankCount = 40
            // if(video && image && text){
            //     contentRankCount = 40
            // } else if((video && text) || (video && image)) {
            //     contentRankCount = 35
            // } else if(video) {
            //     contentRankCount = 30
            // } else if(text && image) {
            //     contentRankCount = 25
            // } else if(image) {
            //     contentRankCount = 20
            // } else if(text) {
            //     contentRankCount = 10
            // }

            // Rank by topic (MAX 40)
            let topicRank = 0
            // const contentHashs = await hashTags.findOne({title: "batch_1"}).lean()
            if(contentHashs){
                const allHashs = contentHashs?.allHashs||{}
                const hashTrack = []
                for(let i=0; i<hashs.length; i++){
                    const curr = hashs[i]
                    const thisHash = allHashs?.[curr]?.count||{cin: 0, bub: 0}
                    const {cin, bub} = thisHash
                    const totalRet = cin+bub
                    hashTrack.push(totalRet)
                }

                const high = Math.max(...hashTrack)
                let totavg = 0
                for(let i=0; i<hashTrack.length; i++){
                    const curr = hashTrack[i]
                    totavg+=curr
                }

                const avg = totavg/hashTrack.length
                const rate = avg/high
                topicRank = rate*40
            }

            // Rank post by engagement (MAX 40)
            // Next version of this should include checking of the people who replied to see if/how they are related to the person who wants to view (use this to influence he count)
            let engagementRank = 0
            let totalEngScore = Math.max(...[likes, shares, replys])
            const engConstant = totalEngScore/impressions
            if(engConstant>0 && engConstant<=0.001) {
                engagementRank = 10
            } else if(engConstant>0.001 && engConstant<=0.005){
                engagementRank = 15
            } else if(engConstant>0.005 && engConstant<=0.01){
                engagementRank = 20
            } else if(engConstant>0.01 && engConstant<=0.03){
                engagementRank = 25
            } else if(engConstant>0.03 && engConstant<=0.05){
                engagementRank = 30
            } else if(engConstant>0.05){
                engagementRank = 40
            }

            // Decay Rank (MAX 40)
            let decayRank = 40
            const now = new Date().toISOString()
            const daygap = getDateGap(now, created, "day")
            if(daygap>=7){
                const thisShare = shares||1
                const thisReply = replys||1
                const thisLikes = likes||1
                const engMount = thisLikes*thisReply*thisShare
                const dayMount = daygap*86400000 // (24*60*60*1000) 
                const counter = engMount/dayMount
                if(counter<40){
                    decayRank = counter
                }
            }

            // const userKnowledge = await userKnowledgebase.findOne({userID}).lean()
            let trackHashInterestIndex = []
            let audienceScore = 0
            if(userKnowledge){
                const {hashTags} = userKnowledge
                for(let i=0; i<hashs.length; i++){
                    const curr = hashs[i]
                    const thisHash = hashTags[curr]
                    if(!thisHash) continue
                    const {like, share, reply, openedAnalytics, openedReply, impression} = thisHash
                    const totalRet = Math.max(like, share, reply, openedAnalytics, openedReply)
                    const hashIndex = totalRet/impression
                    trackHashInterestIndex.push(hashIndex)
                }
                const highestRate = trackHashInterestIndex.length?Math.max(...trackHashInterestIndex):0
                // if(highestRate>=1){
                //     audienceScore = 40
                // } else {
                //     audienceScore = highestRate*40
                // }

                
                if(highestRate>0 && highestRate<=0.01) {
                    audienceScore = 10
                } else if(highestRate>0.01 && highestRate<=0.05){
                    audienceScore = 15
                } else if(highestRate>0.05 && highestRate<=0.1){
                    audienceScore = 20
                } else if(highestRate>0.1 && highestRate<=0.25){
                    audienceScore = 25
                } else if(highestRate>0.25 && highestRate<=0.4){
                    audienceScore = 30
                } else if(highestRate>0.4){
                    audienceScore = 40
                }

                //  checkout to know the right pass mark
                //  if any/or/certain percentage if the weakest hashtag exist, 
            }


            
            const finalScore = contentRankCount + topicRank + engagementRank + decayRank + audienceScore
            response.pass = true
            response.score = finalScore
            if(finalScore>=140){
                response.state = "good"
            } else if(finalScore>=100){
                response.state = "moderate"
            } else if(finalScore>=80){
                response.state = "fair"
            } else {
                response.state = "bad"
            }
        }

        return response
        
    } catch(e){
        console.log(e);
        console.log("clip rank error");
        
        return {pass: false, score: 0, state: "bad"}
    }

    
}