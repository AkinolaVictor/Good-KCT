const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes, deleteObject} = require('firebase/storage')
const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const {database} = require('../../database/firebase')
const { dataType } = require('../../utils/utilsExport')
const sendPushNotification = require('../pushNotification/sendPushNotification')



async function shareBubble(req, res){
    const userID = req.body.userID // userID
    const userIcon = req.body.userIcon // user.id
    const notificationMessage = req.body.notificationMessage // user.id
    const thisBubble = {...req.body.thisBubble} //refDoc, userID, shareStructure
    const fullname = req.body.userFullname // user.userInfo.fullname
    const replyPath = req.body.replyPath // screenModal.data.path
    const each = req.body.each // each
    const path = req.body.path
    let secrecySettings = thisBubble.settings.secrecyData
    let shareSettings = thisBubble.settings.shareData

    
    
    let overallShare = []
    let eachShare = {}
    function spreadShare(path, pathLength, shareStructure){
        let pathClone = [...path]
        if (pathClone.length<pathLength){
            let old = {...eachShare}
            eachShare = {...old[pathClone[0]]}
        }else{
            eachShare = {...shareStructure[pathClone[0]]}
        }
        overallShare.push(eachShare)
        pathClone.shift()
        // recursion
        if (pathClone.length!==0) {
            spreadShare(pathClone, pathLength, shareStructure)
        }
    }

    function buildShare(path){
        // this function builds out the share into a singular nested objects of share: that is, {...,share:{...,share:{...,share:{...}}}}
        const usePath = [...path]
        if(overallShare.length>1){
            for (let i=overallShare.length-1; i>0; i=i-1){
                overallShare[i-1][usePath[i]] = {...overallShare[i]}
            }
            return overallShare[0]
        } else {
            return overallShare[0]
        }
    }
    
    function discernUserIdentity(){
        if(secrecySettings.atmosphere === 'Night'){
            return true
        } else if(secrecySettings.atmosphere === 'Dark room'){
            return true
        } else if(secrecySettings.atmosphere === 'Custom'){
            return true
        } else if(secrecySettings.atmosphere === 'Normal'){
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

    async function shareRequest(shareFeed){
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

            const shareRequestData = {
                time: getDate(),
                bubbleID: thisBubble.postID,
                creatorID: thisBubble.userID,
                userID: userID,
                id: uuidv4(),
                status: 'undefined',
                audience : 'followers',
                message: `${discernUserIdentity()?'someone':fullname} requests your permission to share this bubble`,
                identityStatus: discernUserIdentity(),
                feed: shareFeed,
                type: 'shareRequest'
            }
            // shareRequestData.feed.env='feed'
    
            // check if 
            await getDoc(creatorNotificationsRef).then(async(snapshot)=>{
                if(!snapshot.exists()){
                    setDoc(creatorNotificationsRef, {
                        all: [shareRequestData]
                    })
                } else {
                    // update all
                    const all=[...snapshot.data().all]
                    all.push(shareRequestData)
                    updateDoc(creatorNotificationsRef, {all})
                }
            }).then(()=>{
                const data = {
                    title: `${shareRequestData.message}`,
                    body: `Bubble: ${notificationMessage}`,
                    icon: decideNotifyIcon()
                }
                sendPushNotification(thisBubble.userID, data)
            }).then(()=>{
                console.log("completed");
            }).catch(()=>{
                // do nothing
            })
            
        }
    }

    async function ShareNotifier(notificationData){
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

            const shareData = {
                time: getDate(),
                bubbleID: thisBubble.postID,
                creatorID: thisBubble.userID,
                userID,
                id: uuidv4(),
                message: `${discernUserIdentity()?'someone':fullname} shared your bubble`,
                identityStatus: discernUserIdentity(),
                feed: thisBubble.refDoc,
                type: 'share'
            }
            shareData.feed.env='feed'
    
            // check if 
            await getDoc(creatorNotificationsRef).then(async(snapshot)=>{
                if(!snapshot.exists()){
                    setDoc(creatorNotificationsRef, {
                        all: [shareData]
                    })
                } else {
                    // update all
                    const all=[...snapshot.data().all]
                    all.push(shareData)
                    updateDoc(creatorNotificationsRef, {all})
                }
            }).then(()=>{
                const data = {
                    title: `${shareData.message}`,
                    body: notificationData.message,
                    icon: decideNotifyIcon()
                }
                sendPushNotification(thisBubble.userID, data)
            }).catch(()=>{
                // do nothing
            })
        }
    }

    async function sendShareRequest(){
        // shareRequest(feedRef)
        const feedRequestRef = {
            userID:  thisBubble.userID,
            postID:thisBubble.postID,
            type: 'ShareRef',
            status: 'active',
            sharePath: thisBubble.refDoc.sharePath,
            data: {
                ...thisBubble.refDoc.data,
                type: 'Merge',
                depth: replyPath.length,
                path: replyPath,
                mergeReply: each,
                currentSharer: fullname
            }
        }

        await shareRequest(feedRequestRef)

        const docz = doc(database, 'bubbles', thisBubble.postID)
        await getDoc(docz).then(async(snapshot)=>{
            if(snapshot.exists()){
                const post = {...snapshot.data()}
                post.activities.permissionRequests++
                const activities = post.activities
                await updateDoc(docz, {activities})
            }
        }).then(()=>{
            res.send({successful: true})
        }).catch(()=>{
            res.send({successful: false, message: 'Unable to update bubble'})
        })
    }

    async function shareBubble(){
        const docz = doc(database, 'bubbles', thisBubble.postID)
        await getDoc(docz).then(async(docsnap)=>{
            
            if(docsnap.exists()){
                let posts = {...docsnap.data()}
                let shareStructure = {}
    
                if(typeof(posts.shareStructure) === "string"){
                    shareStructure = {...JSON.parse(posts.shareStructure)}
                } else {
                    shareStructure = posts.shareStructure
                }

                posts.activities.shares++
                if(!posts.activities.allWhoHaveShared[userID]){
                    // posts.activities.shares++
                    posts.activities.allWhoHaveShared[userID] = true
                }

                if(posts.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex){
                } else {
                    posts.activities.lastActivityIndex++
                    posts.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex = posts.activities.lastActivityIndex
                }
                
                posts.activities.iAmOnTheseFeeds[userID].myActivities.shared = true
                posts.activities.iAmOnTheseFeeds[userID].seenAndVerified = true


                
                let pathOfShare = [...thisBubble.refDoc.sharePath]
                const discernPrevShares = () => {
                    // if i'm the last person to share this bubble
                    if(pathOfShare.length>=1 && pathOfShare[pathOfShare.length - 1]===userID){
                        return pathOfShare
                    } else {
                        return [...pathOfShare, userID]
                    }
                }

                const feedRef = {
                    userID:  thisBubble.userID,
                    postID:thisBubble.postID,
                    type: 'ShareRef',
                    status: 'active',
                    sharePath: discernPrevShares(),
                    data: {
                        ...thisBubble.refDoc.data,
                        type: 'Merge',
                        depth: replyPath.length,
                        path: replyPath,
                        mergeReply: each,
                        currentSharer: fullname
                    }
                }

                if(pathOfShare[pathOfShare.length - 1]!==userID){
                    const mainPath = [...thisBubble.refDoc.sharePath]
                    console.log(mainPath);
                    mainPath.shift()
                    const path2 = [...mainPath]
                    console.log(mainPath, path2);
                    if(path2.length>1){
                        spreadShare(path2, path2.length, shareStructure)  // Give it fresh shareStructure
                        // const shareHub = [...overallShare]
                        if(overallShare[overallShare.length-1][userID]===undefined){
                            overallShare[overallShare.length-1][userID] = {}
                            // build destructured share
                            const finalProduct = buildShare(path2)
                            shareStructure[path2[0]] = finalProduct
                        }
                    } else if(path2.length==1){
                        // posts.shareStructure[path2[0]][userID]={}
                        shareStructure[path2[0]][userID]={}
                    } else {
                        // posts.shareStructure[userID]={}
                        shareStructure[userID]={}
                    }

                }

                // send feed out to sharers followers
                const userFollowersDoc = doc(database, 'followers', userID)
                await getDoc(userFollowersDoc).then(async(docsnap)=>{
                    if(docsnap.exists()){
                        const followers = [...Object.keys({...docsnap.data()})]
                        
                        // update yourself if you are sharing a reply
                        if(path.length){
                            // const myFeedRef = doc(database, 'users', userID)
                            const myFeedRef = doc(database, 'feeds', userID)
                            await getDoc(myFeedRef).then(async(docsnap2)=>{
                                if(docsnap2.exists()){
                                    const bubbles = [...docsnap2.data().bubbles]
                    
                                    const current = posts.activities.iAmOnTheseFeeds[userID].replyPath
                                    if(!current.includes(`${path}`)){
                                        // update
                                        posts.activities.iAmOnTheseFeeds[userID].replyPath.push(`${path}`)
                                        bubbles.push(feedRef)
                                        await updateDoc(myFeedRef, {bubbles})
                                    }
                                }
                            })
                        }
            
                        // share with all your followers
                        for(let i=0; i<followers.length; i++){
                            // if you're not sharing a reply
                            if(!path.length){
                                // check if follower has never recieved this bubble (since it has no reply attached to it)
                                if(!posts.activities.iAmOnTheseFeeds[followers[i]]){

                                    // const followersRef = doc(database, 'users', followers[i])
                                    const followersFeedRef = doc(database, 'feeds', followers[i])
                                    await getDoc(followersFeedRef).then(async(docsnap3)=>{
                                        // check if follower has never recieved this bubble (since it has no reply attached to it)
                                        if(docsnap3.exists()){
                                            const bubbles = [...docsnap3.data().bubbles]
                                            const allBubbleIDs = []

                                            for(let j=0; j<bubbles.length; j++){
                                                allBubbleIDs.push(bubbles[j].postID)
                                            }
                                            
                                            if(!allBubbleIDs.includes(thisBubble.postID)){
                                                posts.activities.iAmOnTheseFeeds[followers[i]]={
                                                    index: Object.keys(posts.activities.iAmOnTheseFeeds).length,
                                                    onFeed: true, 
                                                    userID: followers[i],
                                                    mountedOnDevice: false, 
                                                    seenAndVerified: false,
                                                    replyPath: [],
                                                    bots: {},
                                                    myActivities: {
                                                        
                                                    }
                                                }
                                                
                                                bubbles.push(feedRef)
                                                await updateDoc(followersFeedRef, {bubbles})
                                            }
                                        }
                                    })
                                }
                            } else {
                                // if you're sharing a reply
                                
                                //  if this follower is getting this bubble for the first time
                                if(!posts.activities.iAmOnTheseFeeds[followers[i]]){
                                    posts.activities.iAmOnTheseFeeds[followers[i]]={
                                        index: Object.keys(posts.activities.iAmOnTheseFeeds).length,
                                        onFeed: true, 
                                        userID: followers[i],
                                        mountedOnDevice: false,
                                        seenAndVerified: false,
                                        replyPath: [`${path}`],
                                        bots: {},
                                        myActivities: {
                                            
                                        }
                                    }
                                    const followersRef = doc(database, 'feeds', followers[i])
                                    await getDoc(followersRef).then(async(docsnap4)=>{
                                        const bubbles = [...docsnap4.data().bubbles]
                                        bubbles.push(feedRef)
                                        await updateDoc(followersRef, {bubbles})
                                    })
                                } else {
                                    // if this follower has gotten this bubble before
                                    const current = posts.activities.iAmOnTheseFeeds[followers[i]].replyPath
                                    if(!current.includes(`${path}`)){
                                        posts.activities.iAmOnTheseFeeds[followers[i]].replyPath.push(`${path}`)
                                        const followersRef = doc(database, 'feeds', followers[i])
                                        await getDoc(followersRef).then(async(docsnap4)=>{
                                            const bubbles = [...docsnap4.data().bubbles]
                                            bubbles.push(feedRef)
                                            await updateDoc(followersRef, {bubbles})
                                        })
                                    }else{
                                        continue
                                    }
                                }
                                // const followersRef = doc(database, 'users', followers[i])
                                // const followersRef = doc(database, 'feeds', followers[i])
                                // await getDoc(followersRef).then(async(docsnap4)=>{
                                //     const bubbles = [...docsnap4.data().bubbles]
                                //     bubbles.push(feedRef)
                                //     await updateDoc(followersRef, {bubbles})
                                // })
            
                            }
                        }
                    }
                })
                // console.log("completed serving to followers");
                const bubble = posts.bubble[0]
                const notificationData = {
                    message: `Bubble: ${bubble.message||''}`
                }
                ShareNotifier(notificationData)
                // console.log("completed sharing followers");
                // update last activity
                if(!posts.activities.lastActivities){
                    posts.activities.lastActivities=[]
                }
                const thisActivity = 'shared'
                const lastActivities = posts.activities.lastActivities
                const activityData = {
                    activity: thisActivity,
                    userID: userID,
                    date: getDate()
                }

                if(lastActivities.length>0){
                    const last = lastActivities[lastActivities.length - 1]
                    // if the last activity that happen is not the same as this
                    if(last.activity!==thisActivity){
                        for(let i=0; i<lastActivities.length; i++){
                            const current = lastActivities[i]
                            // if this user already has this activity in the stack of activities
                            if(current.userID===userID && current.activity===thisActivity){
                                break
                            }
                            if(i===lastActivities.length-1){
                                posts.activities.lastActivities.push(activityData)
                                if(posts.activities.lastActivities.length>10){
                                    posts.activities.lastActivities.shift()
                                }
                                // updateFunc()
                            }
                        }
                    }
                } else {
                    posts.activities.lastActivities.push(activityData)
                    // updateFunc()
                }
                
                const activities = posts.activities
                const saveShareStructure = JSON.stringify(shareStructure)
                await updateDoc(docz, {activities, shareStructure: saveShareStructure}).then(async()=>{
                    // console.log('finished');
                    if(thisBubble.userID!==userID){
                        // const userRef = doc(database, 'users', userID)
                        const userShareRef = doc(database, 'userShares', userID)
                        await getDoc(userShareRef).then(async(userDoc2)=>{
                            if(userDoc2.exists()){
                                const bubbles = [...userDoc2.data().bubbles]
                                const allPostID = []

                                for(let i=0; i<bubbles.length; i++){
                                    allPostID.push(bubbles[i].postID)
                                }

                                if(!allPostID.includes(thisBubble.postID)){
                                    bubbles.push(thisBubble.refDoc)
                                    await updateDoc(userShareRef, {bubbles})
                                }
                            } else {
                                setDoc(userShareRef, {bubbles: [thisBubble.refDoc]})
                            }
                        }).catch(()=>{})
                    }
                    // await updateDoc(docz, {shareStructure: saveShareStructure})
                }).then(()=>{
                    // console.log("completed");
                    res.send({successful: true})
                })
            } else {
                res.send({successful: false, message: "server error: unable to share bubble"})
            }
        }).catch(()=>{
            console.log("faoled to get bubble");
            res.send({successful: false, message: "server error: failed to share bubble"})
        })
    }

    async function initShare(){
        if(thisBubble.userID===userID){
            await shareBubble()
        } else {
            // if i am not the creator
            if(shareSettings.sharePermission=='Request permission for all'){
                await sendShareRequest()
            } else if(shareSettings.sharePermission=='Request permission only for followers' || shareSettings.sharePermission=='Request permission only for non-followers'){
                const userFollowersDoc = doc(database, 'followers', thisBubble.userID)
                await getDoc(userFollowersDoc).then(async(docsnap)=>{
                    if(docsnap.exists()){
                        const creatorFollowers = {...docsnap.data()}
                        if(shareSettings.sharePermission=='Request permission only for followers'){
                            if(creatorFollowers[userID]){
                                await sendShareRequest()
                            } else {
                                await shareBubble()
                            }
                        } else if(shareSettings.sharePermission=='Request permission only for non-followers'){
                            if(!creatorFollowers[userID]){
                                await sendShareRequest()
                            } else {
                                await shareBubble()
                            }
                        }else {
                            // do nothing
                        }
                    }
                }).catch(()=>{ /* do nothing */  })
            } else {
                await shareBubble()
            }
        }
    }

    await initShare()
}

module.exports = shareBubble