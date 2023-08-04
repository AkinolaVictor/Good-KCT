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
    // thisBubble.userID = thisBubble.userID
    // settings, userID
    // console.log(req.body);
    const sharedReplyPath = [...path].toString()
    
    let overallShare = []
    let eachShare = {}
    function spreadShare(path, pathLength){
        let pathClone = [...path]
        if (pathClone.length<pathLength){
            let old = {...eachShare}
            eachShare = {...old[pathClone[0]]}
        }else{
            eachShare = {...thisBubble.shareStructure[pathClone[0]]}
        }
        overallShare.push(eachShare)
        pathClone.shift()
        // recurrsion
        if (pathClone.length!==0) {
            spreadShare(pathClone, pathLength)
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
        if(secrecySettings.atmosphere === 'Night (Absolute secrecy)'){
            return true
        } else if(secrecySettings.atmosphere === 'Dark room (Absolute secrecy for reply only)'){
            return true
        } else if(secrecySettings.atmosphere === 'Man behind the scene'){
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
            })
        }
    }

    // const docz = doc(database, 'users', thisBubble.userID)
    const docz = doc(database, 'bubbles', thisBubble.postID)
    await getDoc(docz).then(async(docsnap)=>{
        if(docsnap.exists()){
            let posts = {...docsnap.data()}
            // if its not you who shared it last
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
                    // if(pathOfShare.length==1 && pathOfShare[0]===userID){

                    // if i'm the last person to share
                    // if(pathOfShare.length==1 && pathOfShare[pathOfShare.length-1]===userID){
                    if(pathOfShare.length>=1 && pathOfShare[pathOfShare.length-1]===userID){
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

                
                const userFollowersDoc = doc(database, 'followers', thisBubble.userID)
                await getDoc(userFollowersDoc).then(async(docsnap)=>{
                    if(docsnap.exists()){
                        const creatorFollowers = {...docsnap.data()}
                        // request share permission
                        // if i am the creator, just share
                        if(thisBubble.userID===userID){
                            shareBubble()
                        } else {
                            // if i am not the creator
                            if(shareSettings.sharePermission=='Request permission for all'){
                                sendShareRequest(feedRequestRef)
                            } else if(shareSettings.sharePermission=='Request permission only for followers'){
                                if(creatorFollowers[userID]){
                                    sendShareRequest(feedRequestRef)
                                } else {
                                    shareBubble()
                                }
                            } else if(shareSettings.sharePermission=='Request permission only for non-followers'){
                                if(!creatorFollowers[userID]){
                                    sendShareRequest(feedRequestRef)
                                } else {
                                    shareBubble()
                                }
                            } else {
                                shareBubble()
                            }
                        }
                    }
                })

                async function sendShareRequest(feed){
                    // shareRequest(feedRef)
                    shareRequest(feed)
                    // const docz = doc(database, 'users', thisBubble.userID)
                    const docz = doc(database, 'bubbles', thisBubble.postID)
                    await getDoc(docz).then(async(snapshot)=>{
                        if(snapshot.exists()){
                            const post = {...snapshot.data()}
                            post.activities.permissionRequests++
                            const activities = post.activities
                            await updateDoc(docz, {activities})
                        }
                    })
                }

                async function shareBubble(){
                    // // append to share network
                    // // if its not you who shared it last
                    // posts.activities.shares++
                    // if(!posts.activities.allWhoHaveShared[userID]){
                    //     // posts.activities.shares++
                    //     posts.activities.allWhoHaveShared[userID] = true
                    // }
        
                    // if(posts.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex){
        
                    // } else {
                    //     posts.activities.lastActivityIndex++
                    //     posts.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex = posts.activities.lastActivityIndex
                    // }
                    // posts.activities.iAmOnTheseFeeds[userID].myActivities.shared = true
                    // posts.activities.iAmOnTheseFeeds[userID].seenAndVerified = true


                    if(pathOfShare[pathOfShare.length - 1]!==userID){
                        const mainPath = [...thisBubble.refDoc.sharePath]
                        mainPath.shift()
                        const path2 = [...mainPath]
                        if(path2.length>1){
                            spreadShare(path2, path2.length)
                            // const shareHub = [...overallShare]
                            if(overallShare[overallShare.length-1][userID]===undefined){
                                overallShare[overallShare.length-1][userID] = {}
                                // build destructured share
                                const finalProduct = buildShare(path2)
                                posts.shareStructure[path2[0]] = finalProduct
                            }
                        } else if(path2.length==1){
                            posts.shareStructure[path2[0]][userID]={}
                        } else {
                            posts.shareStructure[userID]={}
                        }
        
                    }
                    
                    
                    // send feed out
                    // const userDoc = doc(database, 'users', userID)
                    const userFollowersDoc = doc(database, 'followers', userID)
                    await getDoc(userFollowersDoc).then(async(docsnap)=>{
                        if(docsnap.exists()){
                            const followers = [...Object.keys(docsnap.data())]
                            // let feed = [...docsnap.data().feed]
                            // feed.push(feedRef)
                            
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
                                        // console.log('workedN');
                                        await getDoc(followersFeedRef).then(async(docsnap3)=>{
                                            // console.log('workedR');
                                            // check if follower has never recieved this bubble (since it has no reply attached to it)
                                            if(docsnap3.exists()){
                                                const bubbles = [...docsnap3.data().bubbles]
                                                const allBubbleIDs = []
                                                // console.log('worked');
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
                                                    // console.log('not sure');

                                                // bubbles.push(feedRef)
                                                // await updateDoc(followersFeedRef, {bubbles})
                                            }
                                        })
                                    }
                                } else {
                                    // if you're sharing a reply
                                    // if(!posts.activities.allWhoHaveShared[userID]){
                                    //     posts.activities.shares++
                                    //     posts.activities.allWhoHaveShared[userID]=true
                                    // }
                                    
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
                            // Notify user
                            const bubble = posts.bubble[0]
                            const notificationData = {
                                message: `Bubble: ${bubble.message||''}`
                            }
                            ShareNotifier(notificationData)
                
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
                                if(last.activity!==thisActivity){
                                    for(let i=0; i<lastActivities.length; i++){
                                        const current = lastActivities[i]
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
                            // updateLastActivity(posts, 'shared', ()=>{updateDoc(docz, {activities})})
                            
                            // add bubble to your share in profile 
                            const shareStructure = posts.shareStructure
                            // await updateDoc(docz, {posts}).then(async()=>{
                            await updateDoc(docz, {shareStructure, activities}).then(async()=>{
                                // console.log('finished');
                                if(thisBubble.userID!==userID){
                                    // const userRef = doc(database, 'users', userID)
                                    const userShareRef = doc(database, 'userShares', userID)
                                    await getDoc(userShareRef).then(async(userDoc2)=>{
                                        if(userDoc2.exists()){
                                            // const shares = {...userDoc.data().shares}
                                            // shares = thisBubble.refDoc
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
                                    })
                                }
                            })
                        }
                    })
                }
        } else {
            console.log('failed here');
            res.send({successful: false, message: 'Bubble not found'})
        }
    }).then(()=>{
        res.send({successful: true})
        // console.log('success');
    }).catch(()=>{
        // console.log('failed');
        res.send({successful: false, message: 'Error from the server'})
    })
}

module.exports = shareBubble