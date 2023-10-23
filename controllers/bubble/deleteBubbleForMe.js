const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes, deleteObject} = require('firebase/storage')
// const date = require('date-and-time')
const {database} = require('../../database/firebase')
const Feeds = require('../../models/Feeds')
const userBubbles = require('../../models/userBubbles')
const userReplies = require('../../models/userReplies')
// const userLikes = require('../../models/userLikes.JS')
const userShares = require('../../models/userShares')
const LikeModel = require('../../models/LikeModel')

async function deleteBubbleForMe(req, res){

    const userID = req.body.userID
    // const postID = req.body.postID // thisBubble.postID
    const thisBubble = {...req.body.thisBubble}
    // console.log(thisBubble.);
    try {
        if(thisBubble.userID!==userID){
            const allUserFeeds = await Feeds.findOne({userID})
            if(allUserFeeds){
                for(let i=0; i<allUserFeeds.bubbles.length; i++){
                    const current = allUserFeeds.bubbles[i]
                    if(current.postID === thisBubble.postID){
                        allUserFeeds.bubbles[i]='deleted'
                    }
                }
                // await allUserFeeds.save()
                await Feeds.updateOne({userID}, {bubbles: [...allUserFeeds.bubbles]})
            }
            
            const thisUserbubbles = await userBubbles.findOne({userID})
            if(thisUserbubbles){
                for(let i=0; i<thisUserbubbles.bubbles.length; i++){
                    const current = thisUserbubbles.bubbles[i]
                    if(current.postID === thisBubble.postID){
                        thisUserbubbles.bubbles[i]='deleted'
                    }
                }
                // await thisUserbubbles.save()
                await userBubbles.updateOne({userID}, {bubbles: [...thisUserbubbles.bubbles]})
            }
    
            const thisUserReplies = await userReplies.findOne({userID})
            if(thisUserReplies){
                for(let i=0; i<thisUserReplies.bubbles.length; i++){
                    const current = thisUserReplies.bubbles[i]
                    if(current.postID === thisBubble.postID){
                        thisUserReplies.bubbles[i]='deleted'
                    }
                }
                // await thisUserReplies.save()
                await userReplies.updateOne({userID}, {bubbles: [...thisUserReplies.bubbles]})
            }
    
            // const thisUserLikes = await userLikes.findOne({userID})
            const thisUserLikes = await LikeModel.findOne({userID})
            if(thisUserLikes){
                for(let i=0; i<thisUserLikes.bubbles.length; i++){
                    const current = thisUserLikes.bubbles[i]
                    if(current.postID === thisBubble.postID){
                        thisUserLikes.bubbles[i]='deleted'
                    }
                }
                // await thisUserLikes.save()
                await LikeModel.updateOne({userID}, {bubbles: [...thisUserLikes.bubbles]})
            }
    
            const thisuserShares = await userShares.findOne({userID})
            if(thisuserShares){
                for(let i=0; i<thisuserShares.bubbles.length; i++){
                    const current = thisuserShares.bubbles[i]
                    if(current.postID === thisBubble.postID){
                        thisuserShares.bubbles[i]='deleted'
                    }
                }
                // await thisuserShares.save()
                await userShares.updateOne({userID}, {bubbles: [...thisuserShares.bubbles]})
            }
    
            res.send({successful: true})
        } else {
            res.send({successful: false, message: 'You cannot remove this bubble'})
        }
    } catch(e){
        res.send({successful: false, message: 'Some error was encountered'})
    }

}

module.exports = deleteBubbleForMe