const dataType = require("../dataType")

async function conditionBubbleEngagement({models, feed, num, dir}){
    const {bubble} = models
    const {postID} = feed||{}
    let pass = false
    
    function noOfLikes(thisBubble, reply){
        let repLikeCount = 0
        function calcReplyLikes(replys){
            for(let i=0; i<replys.length; i++){
                
                if(dataType(replys[i])==="object"){
                    repLikeCount = repLikeCount + replys[i].like.length
                    const subReply = replys[i].reply
                    if(subReply.length){
                        calcReplyLikes(subReply)
                    }
                }
            }
            return repLikeCount
        }
        
        let likes = thisBubble.like
        return likes.length + calcReplyLikes(reply)
    }

    function totalBubbleReplies(reply){
        let totalReply = 0
        function countNum (reply){
            for(let i=0; i<reply.length; i++){
                if(dataType(reply[i])=='object'){
                    totalReply++
                    if(reply[i].reply.length){
                        countNum(reply[i].reply)
                    }
                }
            }
            return totalReply
        }
    
        return countNum(reply)
    }

    const thisBubble = await bubble.findOne({postID}).lean()
    if(thisBubble){
        // if(typeof(thisBubble.activities) === "string"){
        //     const activities = JSON.parse(thisBubble.activities)
        //     thisBubble.activities = activities
        // }

        if(typeof(thisBubble.reply) === "string"){
            const reply = JSON.parse(thisBubble.reply)
            thisBubble.reply = reply
        }

        let reply = thisBubble.reply
        const likeCount = noOfLikes(thisBubble, reply)
        const replyCount = totalBubbleReplies(reply)
        const count = dir==="lk"?likeCount:replyCount
        const result = count>=num
        pass = result
    }
    return pass
}

module.exports = conditionBubbleEngagement