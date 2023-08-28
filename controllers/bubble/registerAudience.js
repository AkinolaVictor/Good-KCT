const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
const {database, storage} = require('../../database/firebase')
const sendPushNotification = require('../pushNotification/sendPushNotification')
const { dataType } = require('../../utils/utilsExport')

async function registerAudience(req, res){
    const userID = req.body.userID
    const userName = req.body.userName
    const userImageIcon = req.body.userImageIcon
    const bubbleID = req.body.bubbleID
    const creatorID = req.body.creatorID
    const secrecySettings = req.body.bubbleSettings.secrecyData
    
    
    function discernUserIdentity(){
        if(secrecySettings.atmosphere === 'Night (Absolute secrecy)'){
            return true
        } else if(secrecySettings.atmosphere === 'Dark room (Absolute secrecy for reply only)'){
            return true
        } else if(secrecySettings.atmosphere === 'Man behind the scene'){
            return true
        } else if(secrecySettings.atmosphere === 'Just know its me'){
            return true
        } else if(secrecySettings.atmosphere === 'Annonymous' || secrecySettings.atmosphere === 'Anonymous'){
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
        const userIcon = userImageIcon.length?userImageIcon:false
        if(discernUserIdentity() || userIcon === false){
            return false
        } else {
            return userIcon
        }
    }
    
    function constructTitle(){
        if(discernUserIdentity()){
            return "someone registered as an audience for your bubble"
        } else {
            return `${userName} registered as an audience for your bubble`
        }
    }

    const bubbleRef = doc(database, 'bubbles', bubbleID)
    await getDoc(bubbleRef).then(async(docsnap)=>{
        const post = {...docsnap.data()}
        const bubbleMessage = post.bubble[0].message
        
        if(!post.activities.iAmOnTheseFeeds[userID]){
            post.activities.iAmOnTheseFeeds[userID] = {
                index: Object.keys(post.activities.iAmOnTheseFeeds).length,
                onFeed: true, 
                mountedOnDevice: false,
                userID: userID,
                seenAndVerified: false,
                replyPath: [],
                myActivities: {
                    impression: true
                }
            }

            const activities = post.activities
            await updateDoc(bubbleRef, {activities}).then(()=>{
                // console.log('i go here 1');
                const data = {
                    title: `${constructTitle()}`,
                    body: bubbleMessage,
                    icon: decideNotifyIcon()
                }
                // console.log('i go here 2');

                // sendPushNotification(creatorID, data)
                
            })

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
                        // type: chosenBubble.name
                        type: post.type
                    }
                }
            }

            const userFeedRef = doc(database, 'feeds', userID)
            await getDoc(userFeedRef).then(async(snapshot)=>{
                if(snapshot.exists()){
                    const bubbles = [...snapshot.data().bubbles]
                    
                    for(let i=0; i<bubbles.length; i++){
                        if(dataType(bubbles[i])==='object'){
                            if(bubbles[i].postID === bubbleID){
                                return
                            }
                        }
                    }
                    
                    bubbles.push(feedRef)
                    await updateDoc(userFeedRef, {bubbles})
                }
            })
        }

    }).then(()=>{
        // console.log('success');
        res.send({successful: true})
    }).catch(()=>{
        // console.log('fail');
        res.send({successful: false, message: 'Unable to register audience to this bubble'})
    })
}

module.exports = registerAudience