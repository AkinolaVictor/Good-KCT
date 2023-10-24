const { dataType } = require('../../utils/utilsExport')
// const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
// const date = require('date-and-time')
// const {database, storage} = require('../../database/firebase')
// const sendPushNotification = require('../pushNotification/sendPushNotification')
// const bubble = require('../../models/bubble')
// const Feeds = require('../../models/Feeds')

async function registerAudience(req, res){
    const {Feeds, bubble} = req.dbModels

    const userID = req.body.userID
    const bubbleID = req.body.bubbleID
    const creatorID = req.body.creatorID
    
    try {
        const thisBubble = await bubble.findOne({postID: bubbleID}).lean()
        if(thisBubble){
            if(typeof(thisBubble.activities) === "string"){
                const activities = JSON.parse(thisBubble.activities)
                thisBubble.activities = activities
            }
            
            if(!thisBubble.activities.iAmOnTheseFeeds[userID]){
                thisBubble.activities.iAmOnTheseFeeds[userID] = {
                    index: Object.keys(thisBubble.activities.iAmOnTheseFeeds).length,
                    onFeed: true, 
                    mountedOnDevice: false,
                    userID: userID,
                    seenAndVerified: false,
                    myImpressions: 1,
                    replyPath: [],
                    myActivities: {
                        impression: true
                    }
                }
            }
    
            const activities = JSON.stringify(thisBubble.activities)
            await bubble.updateOne({postID: bubbleID}, {activities})
    
            // give feed ref to user---to be on a safe zone, i have to initialize as deleted...
            let feedRef = 'deleted...'
            if(post.feedRef){
                feedRef = post.feedRef
            }else{
                feedRef = {
                    userID: creatorID,
                    postID: bubbleID,
                    type: 'Ref',
                    status: 'active',
                    sharePath:[creatorID],
                    data:{
                        type: post.type
                    }
                }
            }

            async function giveFeed(){
                const thisUserFeed = await Feeds.findOne({userID})
                if(thisUserFeed===null){
                    const newFeed = new Feeds({userID, bubbles: [feedRef]})
                    await newFeed.save().catch(()=>{
                        res.send({successful: false, message: 'Unable to register audience to this bubble'})
                    })
                } else {
                        
                    for(let i=0; i<thisUserFeed.bubbles.length; i++){
                        if(dataType(thisUserFeed.bubbles[i])==='object'){
                            if(thisUserFeed.bubbles[i].postID === bubbleID){
                                return
                            }
                        }
                    }
                    thisUserFeed.bubbles.push(feedRef)
                    await Feeds.updateOne({userID}, {bubbles: [...thisUserFeed.bubbles]}).catch(()=>{
                    // thisUserFeed.save().catch(()=>{
                        res.send({successful: false, message: 'Unable to register audience to this bubble'})
                    })
                }
            }
            await giveFeed()
    
    
            res.send({successful: true})
    
        } else {
            res.send({successful: false, message: 'Bubble not found'})
        }
    } catch(e){
        res.send({successful: false})
    }
}

module.exports = registerAudience