const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const { dataType } = require('../../utils/utilsExport')
// const {doc, getDoc, updateDoc, setDoc, increment} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes, deleteObject} = require('firebase/storage')
// const {database} = require('../../database/firebase')
// const bubble = require('../../models/bubble')
// const notifications = require('../../models/notifications')
// const LikeModel = require('../../models/LikeModel')

async function dislikeBubble(req, res){
    const {LikeModel, notifications, bubble} = req.dbModels
    
    const userID = req.body.userID // user.id
    const userFullname = req.body.userFullname // user.userInfo.fullname
    const currentBubble = {...req.body.thisBubble}
    
    // thisBubble.userID = thisBubble.user.id
    // settings, userID
    let secrecySettings = currentBubble.settings.secrecyData
    // console.log(req.body);
    function discernUserIdentity(){
        if(secrecySettings.atmosphere === 'Night'){
            return true
        } else if(secrecySettings.atmosphere === 'Dark room'){
            return true
        } else if(secrecySettings.atmosphere === 'Man behind the scene'){
            return true
        } else if(secrecySettings.atmosphere === 'Just know its me'){
            return true
        } else if(secrecySettings.atmosphere === 'Custom'){
            return true
        } else if(secrecySettings.atmosphere === 'Normal'){
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

    async function LikeNotifier(which){
        if(userID!==currentBubble.userID){
            
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
                bubbleID: currentBubble.postID,
                creatorID: currentBubble.userID,
                userID: userID,
                id: uuidv4(),
                message: `${discernUserIdentity()?'someone':userFullname} ${which==='like'?'likes':'dislikes'} your bubble`,
                identityStatus: discernUserIdentity(),
                feed: currentBubble.refDoc,
                type: 'like'
            }

            likeData.feed.env='feed'
    
            // check if 
            const userNotification = await notifications.findOne({userID: currentBubble.userID})
            if(userNotification === null){
                const newUserNotification = new notifications({userID: currentBubble.userID, all: [likeData]})
                await newUserNotification.save()
            } else {
                userNotification.all.push(likeData)
                // await userNotification.save()
                await notifications.updateOne({userID: currentBubble.userID}, {all: [...userNotification.all]})
            }
        }
    }

    const thisBubble = await bubble.findOne({postID: currentBubble.postID}).lean()
    if(thisBubble){
        if(thisBubble.like.includes(userID)){
            if(typeof thisBubble.activities === "string"){
                const activities = JSON.parse(thisBubble.activities)
                thisBubble.activities = activities
            }

            if(thisBubble.activities.iAmOnTheseFeeds[userID]){
                if(thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.liked){
                    delete thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.liked
                }
            }

            for(let i=0; i<thisBubble.like.length; i++){
                if(thisBubble.like[i]===userID){
                    thisBubble.like.splice(i, 1)
                    break
                }
            }
            
        //    thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.liked=true
                
            if(!thisBubble.totalLikes){
                thisBubble.totalLikes = 0
            } else {
                thisBubble.totalLikes--
            }

        }  else {
            res.send({successful: false, message: 'bubble not liked'})
        }
        
        const like = thisBubble.like
        // const totalLikes = thisBubble.totalLikes
        const activities = JSON.stringify(thisBubble.activities)
        await bubble.updateOne({postID: currentBubble.postID}, {like, activities}).then(async()=>{
            await LikeNotifier('dislikes')

            if(thisBubble.userID!==userID){
                // const thisUserLikes = await userLikes.findOne({userID})
                const thisUserLikes = await LikeModel.findOne({userID})

                if(thisUserLikes){
                    for(let i=0; i<thisUserLikes.bubbles.length; i++){
                        if(dataType(thisUserLikes.bubbles[i])==='object'){
                            if(thisUserLikes.bubbles[i].postID === thisBubble.postID){
                                thisUserLikes.bubbles.splice(i, 1)
                            }
                        }

                        if(i===thisUserLikes.length-1){
                            // await thisUserLikes.save()
                            await LikeModel.updateOne({userID}, {bubbles: [...thisUserLikes.bubbles]})
                        }
                    }
                    res.send({successful: true})
                } else {
                    res.send({successful: false, message: 'userLikes not present'})
                }
            }
        }).catch(()=>{
            res.send({successful: false, message: 'unable to update bubble, or something went wrong in the aftermath'})
        })
    } else {
        res.send({successful: false, message: 'bubble not found'})
    }
}

module.exports = dislikeBubble