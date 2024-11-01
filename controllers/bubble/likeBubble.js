const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const { dataType } = require('../../utils/utilsExport')
const sendPushNotification = require('../pushNotification/sendPushNotification')
const sendPushNotification_2 = require('../pushNotification/sendPushNotification_2')
const knowledgeBuilder = require('../../utils/knowledgeBuilder')
// const {doc, getDoc, updateDoc, setDoc, increment} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes, deleteObject} = require('firebase/storage')
// const {database} = require('../../database/firebase')
// const bubble = require('../../models/bubble')
// const notifications = require('../../models/notifications')
// const LikeModel = require('../../models/LikeModel')

async function likeBubble(req, res){
    const {LikeModel, notifications, bubble, eachUserAnalytics} = req.dbModels

    const userID = req.body.userID // user.id
    const userIcon = req.body.userIcon // user.id
    const userFullname = req.body.userFullname // user.userInfo.fullname
    const currentBubble = {...req.body.thisBubble}
    const feedRef = currentBubble.refDoc
    // console.log(currentBubble.userID);
    // console.log(userID);
    // thisBubble.userID = thisBubble.user.id
    // settings, userID
    let secrecySettings = currentBubble.settings.secrecyData
    // console.log(userIcon);
    function discernUserIdentity(){
        if(secrecySettings.atmosphere === 'Night'){
            return true
        } else if(secrecySettings.atmosphere === 'Custom'){
            return true
        } else if(secrecySettings.atmosphere === 'Normal'){
            return true
        } else if(secrecySettings.atmosphere === 'Dark room'){
            return true
        } else if(secrecySettings.atmosphere === 'Man behind the scene'){
            return true
        } else if(secrecySettings.atmosphere === 'Just know its me'){
            return true
        } else if(secrecySettings.atmosphere === 'Anonymous'){
            return false
        } else if(secrecySettings.atmosphere === 'On mask'){
            return true
        } else if(secrecySettings.atmosphere === 'I see you all'){
            return true
        } else if(secrecySettings.atmosphere === 'Day (Absolute openness)'){
            return false
        } else {
            return false
        }
    }

    function decideNotifyIcon(){
        if(discernUserIdentity() || userIcon === false){
            return false
        } else {
            return userIcon
        }
    }

    function getDate(){
        const now = new Date()
        const time = date.format(now, 'h:mm:ssA')
        const when = date.format(now, 'DD/MM/YYYY')
        const dateString = date.format(now, 'YYYY,MM,DD,HH,mm,ss')
        return {
            time,
            date: when,
            dateString
        }
    }

    const currentDate = getDate()

    async function LikeNotifier(which, notificationData){
        if(userID!==currentBubble.userID){
            const likeData = {
                // time: currentDate,
                when: new Date().toISOString(),
                bubbleID: currentBubble.postID,
                creatorID: currentBubble.userID,
                userID,
                id: uuidv4(),
                message: `${discernUserIdentity()?'someone':userFullname} ${which==='like'?'likes':'dislikes'} your bubble`,
                identityStatus: discernUserIdentity(),
                feed: currentBubble.refDoc,
                type: 'like'
            }

            likeData.feed.env='feed'
    
            // check if user has notification
            const userNotification = await notifications.findOne({userID: currentBubble.userID})
            let access = true
            if(userNotification === null){
                const newNotification = new notifications({userID: currentBubble.userID, all: [likeData]})
                await newNotification.save().catch((e)=>{
                    console.log(e);
                    // access = false
                })
            } else {
                userNotification.all.push(likeData)
                // await userNotification.save().catch(()=>{access = false})
                await notifications.updateOne({userID: currentBubble}, {all: [...userNotification.all]}).catch((e)=>{
                    console.log(e);
                    // access = false
                })
            }
            
            // if(access){
                const data = {
                    // title: `${likeData.message}`,
                    // body: notificationData.message,
                    title: notificationData?.message?.length?`${likeData.message}`:"Concealed",
                    body: notificationData?.message?.length?notificationData.message:`${likeData.message}`,
                    data: {
                        feed: currentBubble.refDoc,
                        // url: "viewbubble/something/others",
                        type: "bubble"
                    }
                }

                await sendPushNotification(currentBubble.userID, data, req)

                await sendPushNotification_2({
                    userIDs: [currentBubble.userID],
                    data, req,
                })
            // }
        }
    }

    async function updateUserAnalytics(thisBubble){
        const userAnalytics = await eachUserAnalytics.findOne({userID: thisBubble.user.id}).lean()
        if(userAnalytics === null){
            const data = {
                userID: thisBubble.user.id, 
                bubbles: {
                    [userID]: {
                        impressions: 1, replys: 0, likes: 1, shares: 0,
                        bubbleIDs: [thisBubble.postID]
                    }
                }, 
                profile: {
                    [userID]: {
                        follow: 0, 
                        views: 0
                    }
                },
                date: {}
                // date: {...getDate()}
            }
            const newUserAnalytics = new eachUserAnalytics({...data})
            await newUserAnalytics.save()
        } else {
            const {bubbles} = userAnalytics
            if(!bubbles[userID]){
                bubbles[userID] = {
                    impressions: 1,
                    likes: 1, replys: 0, shares: 0,
                    bubbleIDs: [thisBubble.postID]
                }
            } else {
                bubbles[userID].likes++
                if(!bubbles[userID].bubbleIDs.includes(thisBubble.postID)){
                    bubbles[userID].bubbleIDs.push(thisBubble.postID)
                }
            }
            await eachUserAnalytics.updateOne({userID: thisBubble.user.id}, {bubbles})
        }
    }
    try{
        const thisBubble = await bubble.findOne({postID: currentBubble.postID}).lean()
        if(thisBubble){
            if(typeof(thisBubble.activities)==="string"){
                const activities = JSON.parse(thisBubble.activities)
                thisBubble.activities = activities
            }
    
            if(!thisBubble.like.includes(userID)){
                thisBubble.like.push(userID)
            }
    
            if(thisBubble.activities.iAmOnTheseFeeds[userID]){
                if(!thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex){
                    thisBubble.activities.lastActivityIndex++
                    thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex = thisBubble.activities.lastActivityIndex
                }
    
               thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.liked=true
               thisBubble.activities.iAmOnTheseFeeds[userID].seenAndVerified=true
    
                // Update last activities
                const activity = 'liked'
    
                if(!thisBubble.activities.lastActivities){
                    thisBubble.activities.lastActivities=[]
                }
        
                const lastActivities = thisBubble.activities.lastActivities
                const activityData = {
                    activity,
                    userID,
                    date: currentDate
                }
    
                if(lastActivities.length>0){
                    const last = lastActivities[lastActivities.length - 1]
                    if(last.activity!==activity){
                        for(let i=0; i<lastActivities.length; i++){
                            const current = lastActivities[i]
                            if(current.userID===userID && current.activity===activity){
                                break
                            }
                            if(i===lastActivities.length-1){
                                thisBubble.activities.lastActivities.push(activityData)
                                if(thisBubble.activities.lastActivities.length>10){
                                    thisBubble.activities.lastActivities.shift()
                                }
                            }
                        }
                    }
                } else {
                    thisBubble.activities.lastActivities.push(activityData)
                }
    
                const activities = JSON.stringify(thisBubble.activities)
                const like = thisBubble.like
                // const totalLikes = thisBubble.totalLikes + 1
                await bubble.updateOne({postID: currentBubble.postID}, {activities, like}).then(async()=>{
                    const bubbleMessage = thisBubble.bubble[0]
                    const notificationData = {
                        message: `${bubbleMessage.message||''}`
                    }
                    await LikeNotifier('like', notificationData)
                    await updateUserAnalytics(thisBubble)
                    const metaData = feedRef.metaData||{}
                    const {hash} = metaData || {hash: {}}
                    await knowledgeBuilder({userID, models: req.dbModels, which: "likes", intent: "hashtags", hash: [...Object.keys(hash)]})
    
                    if(currentBubble.userID!==userID){
                        // const thisUserLikes = await userLikes.findOne({userID})
                        const thisUserLikes = await LikeModel.findOne({userID})
                        if(thisUserLikes === null){
                            const newUserLike = new LikeModel({userID, bubbles: [currentBubble.refDoc]})
                            // const newUserLike = new userLikes.findOne({userID, bubbles: [currentBubble.refDoc]})
                            await newUserLike.save()
                        } else {
                            const allLikesID = []
    
                            for(let i=0; i<thisUserLikes.bubbles.length; i++){
                                if(dataType(thisUserLikes.bubbles[i])==='object'){
                                    allLikesID.push(thisUserLikes.bubbles[i].postID)
                                }
                            }
    
                            if(!allLikesID.includes(thisBubble.postID)){
                                thisUserLikes.bubbles.push(currentBubble.refDoc)
                                // await thisUserLikes.save()
                                await LikeModel.updateOne({userID}, {bubbles: [...thisUserLikes.bubbles]})
                            }
                        }
                    // } else {
                    //     console.log("ready...");
                    }
    
                }).then(()=>{
                    res.send({successful: true})
                }).catch((e)=>{
                    console.log(e, "failed here 1");
                    res.send({successful: false, message: 'Error from the server'})
                })
            } else {
                res.send({successful: false, message: 'user not recognized'})
            }
            
        } else {
            res.send({successful: false, message: 'bubble not found'})
        }
    } catch(e){
        console.log(e);
        console.log("faileddd");
        res.send({successful: false, message: 'caught after a failure'})
    }
}

module.exports = likeBubble