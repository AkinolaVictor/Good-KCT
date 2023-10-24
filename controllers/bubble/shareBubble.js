const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const sendPushNotification = require('../pushNotification/sendPushNotification')
// const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const { dataType } = require('../../utils/utilsExport')
// const notifications = require('../../models/notifications')
// const bubble = require('../../models/bubble')
// const Followers = require('../../models/Followers')
// const Feeds = require('../../models/Feeds')
// const userShares = require('../../models/userShares')

async function shareBubble(req, res){
    const {userShares, Feeds, Followers, bubble, notifications} = req.dbModels

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
            try {
                const creatorNotification = await notifications.findOne({userID: thisBubble.userID})
                if(creatorNotification === null){
                    const newNotif = new notifications({userID: thisBubble.userID, all: [shareRequestData]})
                    await newNotif.save()
                } else {
                    creatorNotification.all.push(shareRequestData)
                    // await creatorNotification.save()
                    await notifications.updateOne({userID: thisBubble.userID}, {all: [...creatorNotification.all]})
                }
                const data = {
                    title: `${shareRequestData.message}`,
                    body: `Bubble: ${notificationMessage}`,
                    icon: decideNotifyIcon()
                }
                await sendPushNotification(thisBubble.userID, data, req)
            } catch(e){
                // DO NOTHING
            }
        }
    }

    async function ShareNotifier(notificationData){
        if(userID!==thisBubble.userID){
            
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
            try{
                const creatorNotifications = await notifications.findOne({userID: thisBubble.userID})
                if(creatorNotifications === null){
                    const newNotif = new notifications({userID: thisBubble.userID, all: [shareData]})
                    await newNotif.save()
                } else {
                    creatorNotifications.all.push(shareData)
                    // await creatorNotifications.save()
                    await notifications.updateOne({userID: thisBubble.userID}, {all: [...creatorNotifications.all]})
                }
                const data = {
                    title: `${shareData.message}`,
                    body: notificationData.message,
                    icon: decideNotifyIcon()
                }
                await sendPushNotification(thisBubble.userID, data, req)
            } catch (e){
                // DO NOTHING
            }
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
        try{
            const currentBubble = await bubble.findOne({postID: thisBubble.postID}).lean()
            if(currentBubble === null){
                res.send({successful: false, message: "Bubble not found"})
            } else {
                if(typeof(currentBubble.activities)==="string"){
                    const activities = JSON.parse(currentBubble.activities)
                    currentBubble.activities = activities
                }
                currentBubble.activities.permissionRequests++
                const activities = JSON.stringify(currentBubble.activities)
                await bubble.updateOne({postID: thisBubble.postID}, {activities})
                res.send({successful: true})
            }

        } catch (e){
            res.send({successful: false, message: 'Unable to update bubble'})
        }
    }

    async function shareBubble(){
        try {
            const currentBubble = await bubble.findOne({postID: thisBubble.postID}).lean()
            if(currentBubble === null){
                res.send({successful: false, message: "server error: bubble not found"})
            } else {
                let shareStructure = {}
    
                if(typeof(currentBubble.shareStructure) === "string"){
                    shareStructure = {...JSON.parse(currentBubble.shareStructure)}
                } else {
                    shareStructure = currentBubble.shareStructure
                }

                if(typeof(currentBubble.activities)==="string"){
                    const activities = JSON.parse(currentBubble.activities)
                    currentBubble.activities = activities
                }

                currentBubble.activities.shares++
                if(!currentBubble.activities.allWhoHaveShared[userID]){
                    // currentBubble.activities.shares++
                    currentBubble.activities.allWhoHaveShared[userID] = true
                }

                if(currentBubble.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex){
                } else {
                    currentBubble.activities.lastActivityIndex++
                    currentBubble.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex = currentBubble.activities.lastActivityIndex
                }
                
                currentBubble.activities.iAmOnTheseFeeds[userID].myActivities.shared = true
                currentBubble.activities.iAmOnTheseFeeds[userID].seenAndVerified = true


                
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
                    userID: thisBubble.userID,
                    postID: thisBubble.postID,
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
                    mainPath.shift()
                    const path2 = [...mainPath]
                    if(path2.length>1){
                        spreadShare(path2, path2.length, shareStructure)  // Give it fresh shareStructure
                        if(overallShare[overallShare.length-1][userID]===undefined){
                            overallShare[overallShare.length-1][userID] = {}
                            // build destructured share
                            const finalProduct = buildShare(path2)
                            shareStructure[path2[0]] = finalProduct
                        }
                    } else if(path2.length==1){
                        shareStructure[path2[0]][userID]={}
                    } else {
                        shareStructure[userID]={}
                    }

                }

                // send feed out to sharers followers
                const userFollowers = await Followers.findOne({userID}).lean()
                if(userFollowers){
                    // update yourself if you are sharing a reply
                    const followers = [...Object.keys({...userFollowers.followers})]

                    if(path.length){
                        const userFeed = await Feeds.findOne({userID})
                        if(userFeed){
                            const current = currentBubble.activities.iAmOnTheseFeeds[userID].replyPath
                            if(!current.includes(`${path}`)){
                                // update
                                currentBubble.activities.iAmOnTheseFeeds[userID].replyPath.push(`${path}`)
                                userFeed.bubbles.push(feedRef)
                                // await userFeed.save()
                                await Feeds.updateOne({userID}, {bubbles: [...userFeed.bubbles]})
                            }
                        }
                    }
                    // share with all your followers
                    for(let i=0; i<followers.length; i++){
                        // if you're not sharing a reply
                        if(!path.length){
                            // check if follower has never recieved this bubble (since it has no reply attached to it)
                            if(!currentBubble.activities.iAmOnTheseFeeds[followers[i]]){
                                const currentFollowerFeed = await Feeds.findOne({userID: followers[i]})
                                if(currentFollowerFeed){
                                    const allBubbleIDs = []

                                    for(let j=0; j<currentFollowerFeed.bubbles.length; j++){
                                        allBubbleIDs.push(currentFollowerFeed.bubbles[j].postID)
                                    }
                                    
                                    if(!allBubbleIDs.includes(thisBubble.postID)){
                                        currentBubble.activities.iAmOnTheseFeeds[followers[i]]={
                                            index: Object.keys(currentBubble.activities.iAmOnTheseFeeds).length,
                                            onFeed: true,
                                            userID: followers[i],
                                            mountedOnDevice: false,
                                            seenAndVerified: false,
                                            myImpressions: 0,
                                            replyPath: [],
                                            bots: {},
                                            myActivities: {
                                            }
                                        }
                                        
                                        currentFollowerFeed.bubbles.push(feedRef)
                                        await Feeds.updateOne({userID: followers[i]}, {bubbles: [...currentFollowerFeed.bubbles]})
                                        // await currentFollowerFeed.save()
                                    }
                                }
                            }
                        } else {
                            if(!currentBubble.activities.iAmOnTheseFeeds[followers[i]]){
                                currentBubble.activities.iAmOnTheseFeeds[followers[i]]={
                                    index: Object.keys(currentBubble.activities.iAmOnTheseFeeds).length,
                                    onFeed: true, 
                                    userID: followers[i],
                                    mountedOnDevice: false,
                                    seenAndVerified: false,
                                    myImpressions: 0,
                                    replyPath: [`${path}`],
                                    bots: {},
                                    myActivities: {
                                        
                                    }
                                }
                                const followerFeed = await Feeds.findOne({userID: followers[i]})
                                if(followerFeed){
                                    followerFeed.bubbles.push(feedRef)
                                    // await followerFeed.save()
                                    await Feeds.updateOne({userID: followers[i]}, {bubbles: [...followerFeed.bubbles]})
                                }
                            } else {
                                // if this follower has gotten this bubble before
                                const current = currentBubble.activities.iAmOnTheseFeeds[followers[i]].replyPath
                                if(!current.includes(`${path}`)){
                                    currentBubble.activities.iAmOnTheseFeeds[followers[i]].replyPath.push(`${path}`)
                                    const followerFeed = await Feeds.findOne({userID: followers[i]})
                                    if(followerFeed){
                                        followerFeed.bubbles.push(feedRef)
                                        // await followerFeed.save()
                                        await Feeds.updateOne({userID: followers[i]}, {bubbles: [...followerFeed.bubbles]})
                                    }
                                }else{
                                    continue
                                }
                            }
                        }
                    }
                }

                const bubblex = currentBubble.bubble[0]
                const notificationData = {
                    message: `Bubble: ${bubblex.message||''}`
                }
                await ShareNotifier(notificationData)
                // update last activity
                if(!currentBubble.activities.lastActivities){
                    currentBubble.activities.lastActivities=[]
                }
                const thisActivity = 'shared'
                const lastActivities = currentBubble.activities.lastActivities
                const activityData = {
                    activity: thisActivity,
                    userID,
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
                                currentBubble.activities.lastActivities.push(activityData)
                                if(currentBubble.activities.lastActivities.length>10){
                                    currentBubble.activities.lastActivities.shift()
                                }
                            }
                        }
                    }
                } else {
                    currentBubble.activities.lastActivities.push(activityData)
                }
                const activities = JSON.stringify(currentBubble.activities)
                const saveShareStructure = JSON.stringify(shareStructure)
                await bubble.updateOne({postID: thisBubble.postID}, {activities, shareStructure: saveShareStructure}).then(async()=>{
                    if(thisBubble.userID!==userID){
                        const thisUserShares = await userShares.findOne({userID})
                        if(thisUserShares === null){
                            const newShare = new userShares({userID, bubbles: [thisBubble.refDoc]})
                            await newShare.save()
                        } else {
                            const allPostID = []
                            
                            for(let i=0; i<thisUserShares.bubbles.length; i++){
                                allPostID.push(thisUserShares.bubbles[i].postID)
                            }
                            
                            if(!allPostID.includes(thisBubble.postID)){
                                thisUserShares.bubbles.push(thisBubble.refDoc)
                                // await thisUserShares.save()
                                await userShares.updateOne({userID}, {bubbles: [...thisUserShares.bubbles]})
                            }
                        }
                    }
                }).catch(()=>{})

                res.send({successful: true})
            }

        } catch(e){
            res.send({successful: false, message: "server error: failed to share bubble"})
        }
    }

    async function initShare(){
        if(thisBubble.userID===userID){
            await shareBubble()
        } else {
            // if i am not the creator
            if(shareSettings.sharePermission=='Request permission for all'){
                await sendShareRequest()
            } else if(shareSettings.sharePermission=='Request permission only for followers' || shareSettings.sharePermission=='Request permission only for non-followers'){
                const creatorFollowers = await Followers.findOne({userID: thisBubble.userID}).lean()
                if(creatorFollowers){
                    if(shareSettings.sharePermission=='Request permission only for followers'){
                        if(creatorFollowers.followers[userID]){
                            await sendShareRequest()
                        } else {
                            await shareBubble()
                        }
                    } else if(shareSettings.sharePermission=='Request permission only for non-followers'){
                        if(!creatorFollowers.followers[userID]){
                            await sendShareRequest()
                        } else {
                            await shareBubble()
                        }
                    }else {
                        // do nothing
                    }
                }
            } else {
                await shareBubble()
            }
        }
    }

    await initShare()
}

module.exports = shareBubble