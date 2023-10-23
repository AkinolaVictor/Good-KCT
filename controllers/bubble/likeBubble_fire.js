const {doc, getDoc, updateDoc, setDoc, increment} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes, deleteObject} = require('firebase/storage')
const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const {database} = require('../../database/firebase')
const { dataType } = require('../../utils/utilsExport')
const sendPushNotification = require('../pushNotification/sendPushNotification')

async function likeBubble(req, res){
    const userID = req.body.userID // user.id
    const userIcon = req.body.userIcon // user.id
    const userFullname = req.body.userFullname // user.userInfo.fullname
    const thisBubble = {...req.body.thisBubble}
    // thisBubble.userID = thisBubble.user.id
    // settings, userID
    let secrecySettings = thisBubble.settings.secrecyData
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

    async function LikeNotifier(which, notificationData){
        if(userID!==thisBubble.userID){
            const creatorNotificationsRef = doc(database, 'notifications', thisBubble.userID)
            // const userNotificationsRef = doc(database, 'notifications', userID)
            
            // data
            function getDate(){
                const now = new Date()
                const time = date.format(now, 'h:mmA')
                const when = date.format(now, 'DD/MM/YYYY')
                const dateString = date.format(now, 'YYYY,MM,DD,HH,mm,ss')
                
                return {
                    time,
                    date: when,
                    dateString
                }
            }

            const likeData = {
                time: getDate(),
                bubbleID: thisBubble.postID,
                creatorID: thisBubble.userID,
                userID: userID,
                id: uuidv4(),
                message: `${discernUserIdentity()?'someone':userFullname} ${which==='like'?'likes':'dislikes'} your bubble`,
                identityStatus: discernUserIdentity(),
                feed: thisBubble.refDoc,
                type: 'like'
            }
            likeData.feed.env='feed'
    
            // check if 
            await getDoc(creatorNotificationsRef).then(async(snapshot)=>{
                if(!snapshot.exists()){
                    setDoc(creatorNotificationsRef, {
                        all: [likeData]
                    })
                } else {
                    // update all
                    const all=[...snapshot.data().all]
                    all.push(likeData)
                    updateDoc(creatorNotificationsRef, {all})
                }
            }).then(()=>{
                const data = {
                    title: `${likeData.message}`,
                    body: notificationData.message,
                    icon: decideNotifyIcon()
                }
                sendPushNotification(thisBubble.userID, data)
            })
        }
    }

    function updateLastActivity(thisPost, activity, updateFunc){
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

        if(!thisPost.activities.lastActivities){
            thisPost.activities.lastActivities=[]
        }

        const lastActivities = thisPost.activities.lastActivities
        const activityData = {
            activity,
            userID: userID,
            date: getDate()
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
                        thisPost.activities.lastActivities.push(activityData)
                        if(thisPost.activities.lastActivities.length>10){
                            thisPost.activities.lastActivities.shift()
                        }
                        updateFunc()
                    }
                }
            }
        } else {
            thisPost.activities.lastActivities.push(activityData)
            updateFunc()
        }
    }

    const docz = doc(database, 'bubbles', thisBubble.postID)
    await getDoc(docz).then(async(docsnap)=>{
        if(docsnap.exists()){
            const posts = {...docsnap.data()}
            if(!posts.like.includes(userID)){
                posts.like.push(userID)
                
                // if(!posts.totalLikes){
                //     posts.totalLikes = 1
                // } else {
                //     posts.totalLikes++
                // }

                if(posts.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex){
                } else {
                    posts.activities.lastActivityIndex++
                    posts.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex=posts.activities.lastActivityIndex
                }

                posts.activities.iAmOnTheseFeeds[userID].myActivities.liked=true
                posts.activities.iAmOnTheseFeeds[userID].seenAndVerified=true
                const activities = posts.activities
                // update last activities
                // updateLastActivity(posts, 'liked', ()=>{updateDoc(docz, {...posts})})
                updateLastActivity(posts, 'liked', ()=>{updateDoc(docz, {activities})})
                
                // console.log(posts.activities)
                // console.log('done-not');
                const like = posts.like
                await updateDoc(docz, {totalLikes: increment(1),like}).then(async()=>{
                // await updateDoc(docz, {...posts}).then(async()=>{
                    // console.log('done');
                    const bubble = posts.bubble[0]
                    const notificationData = {
                        message: `Bubble: ${bubble.message||''}`
                    }
                    LikeNotifier('like', notificationData)
                    
                    if(thisBubble.userID!==userID){
                        const userLikesRef = doc(database, 'userLikes', userID)
                        await getDoc(userLikesRef).then((userLikes)=>{
                            if(userLikes.exists()){
                                const bubbles = [...userLikes.data().bubbles]
                                const allLikesID = []

                                for(let i=0; i<bubbles.length; i++){
                                    if(dataType(bubbles[i])==='object'){
                                        allLikesID.push(bubbles[i].postID)
                                    }
                                }

                                if(!allLikesID.includes(thisBubble.postID)){
                                    bubbles.push(thisBubble.refDoc)
                                    updateDoc(userLikesRef, {bubbles})
                                }
                            } else {
                                setDoc(userLikesRef, {
                                    bubbles: [thisBubble.refDoc]
                                })
                            }
                        })
                    }
                }).catch(()=>{
                    // alert('failed to update like')
                })
            }
            
        } else {
            res.send({successful: false, message: 'bubble not found'})
        }
    }).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        res.send({successful: false, message: 'Error from the server'})
    })
}

module.exports = likeBubble