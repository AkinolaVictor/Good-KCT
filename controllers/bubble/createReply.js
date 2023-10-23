const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')
const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const { dataType } = require('../../utils/utilsExport')
const sendPushNotification = require('../pushNotification/sendPushNotification')
const bubble = require('../../models/bubble')
const userReplies = require('../../models/userReplies')
const notifications = require('../../models/notifications')


async function createReply_Old(req, res){
    const path = req.body.path /* props.path */
    const creatorID = req.body.creatorID /* thisBubble.user.id */
    const postID = req.body.postID /* thisBubble.postID */
    const userID = req.body.userID /* user.id */
    const userIcon = req.body.userIcon // user.id
    const data = req.body.data /* data */
    const fullname = req.body.fullname /* user.userInfo.fullname */
    const parentName = req.body.parentName /* props.replyData.name */
    const parentID = req.body.parentID /* props.replyData.userID */
    const refDoc = req.body.refDoc /* refDoc */
    const discernUserIdentity = req.body.discernUserIdentity /* discernUserIdentity() */
    
    // res.send({successful: true})
    
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

    const thisDate = getDate()
    
    function updateLastActivity(thisPost, activity, updateFunc){
        if(!thisPost.activities.lastActivities){
            thisPost.activities.lastActivities=[]
        }
        const lastActivities = thisPost.activities.lastActivities
        const activityData = {
            activity,
            userID,
            date: thisDate
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

    function decideNotifyIcon(){
        if(discernUserIdentity || userIcon === false){
            return false
        } else {
            return userIcon
        }
    }

    async function ReplyNotifier(notificationData){
        if(userID!==creatorID){
            // console.log('notify 1');
            function constructCreatorMessage(){
                if(discernUserIdentity){
                    if(path.length===0){
                        return `someone replied your bubble`
                    } else {
                        return `a reply was replied in your bubble`
                    }
                } else {
                    if(path.length===0){
                        return `${fullname} replied your bubble`
                    } else {
                        return `${fullname} replied to ${parentName}`
                    }
                }
            }

            // data
            const creatorData = {
                time: getDate(),
                bubbleID: postID,
                creatorID: creatorID,
                replyPath: path,
                userID: userID,
                id: uuidv4(),
                message: constructCreatorMessage(),
                identityStatus: discernUserIdentity,
                feed: refDoc,
                type: 'reply'
            }
            creatorData.feed.env='feed'
            
            const userNotification = await notifications.findOne({userID: creatorID})
            let access = true
            if(userNotification === null){
                const newUserNotification = new notifications({userID: creatorID, all: [creatorData]})
                newUserNotification.save().catch(()=>{access = false})
            } else {
                userNotification.all.push(creatorData)
                // await userNotification.save().catch(()=>{access = false})
                await notifications.updateOne({userID: creatorID}, {all: [...userNotification.all]}).catch(()=>{access = false})
            }

            if(access){
                const data = {
                    title: `${creatorData.message}`,
                    body: notificationData.message,
                    icon: decideNotifyIcon()
                }
                sendPushNotification(creatorID, data)
            }
        }

        // update user
        // if(path.length>0 && (props.replyData.userID!==creatorID || props.replyData.userID!==userID)){
        // console.log(parentID);
        if(path.length>0 && (parentID!==userID)){

            const mainUserNotificationsRef = doc(database, 'notifications', parentID)

            function constructMainUserMessage(){
                if(discernUserIdentity){
                    if(path.length>0){
                        return `someone replied you`
                    }
                } else {
                    if(path.length>0){
                        return `${fullname} replied you`
                    }
                }
            }

            const mainReplyData = {
                time: getDate(),
                bubbleID: postID,
                mainReplier: parentID,
                creatorID: creatorID,
                replyPath: path,
                userID: userID,
                id: uuidv4(),
                replyCreatorID: parentID,
                message: constructMainUserMessage(),
                identityStatus: discernUserIdentity,
                feed: refDoc,
                type: 'reply'
            }
            mainReplyData.feed.env='feed'

            const parentNotification = await notifications.findOne({userID: parentID})
            let access = true
            if(parentNotification === null){
                const newParentNotification = new notifications({userID: parentID, all: [mainReplyData]})
                await newParentNotification.save().catch(()=>{access = false})
            } else {
                parentNotification.all.push(mainReplyData)
                await notifications.updateOne({userID: parentID}, {all: [...parentNotification.all]}).catch(()=>{access = false})
                // await parentNotification.save().catch(()=>{access = false})
            }
            if(access){
                const data = {
                    title: `${mainReplyData.message}`,
                    body: notificationData.message,
                    icon: decideNotifyIcon()
                }
                await sendPushNotification(parentID, data)
            }
        }
    }

    
    const thisBubble = await bubble.findOne({postID}).lean()
    if(thisBubble){
        let replys = thisBubble.reply
        if(typeof(replys) === "string"){
            replys = JSON.parse(thisBubble.reply)
        }

        if(typeof(thisBubble.activities)==="string"){
            let activities = JSON.parse(thisBubble.activities)
            thisBubble.activities = activities
            activities={}
        }
        // const thisPost = posts
        if(thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.replied){
            data.replyNumber = thisBubble.activities.iAmOnTheseFeeds[userID].replyNumber
        } else {
            // increment activity index
            if(!thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex){
                thisBubble.activities.lastActivityIndex++
                thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex = thisBubble.activities.lastActivityIndex
            }

            // give a number to the person replying
            if(thisBubble.activities.iAmOnTheseFeeds[userID].replyNumber){
                data.replyNumber = thisBubble.activities.iAmOnTheseFeeds[userID].replyNumber
            }else {
                const allOnFeed = [...Object.values(thisBubble.activities.iAmOnTheseFeeds)]
                let count = 0

                for(let i=0; i<allOnFeed.length; i++){
                    const current = allOnFeed[i]
                    if(current.replyNumber){
                        count++
                    }
                }

                thisBubble.activities.iAmOnTheseFeeds[userID].replyNumber = count+1
                data.replyNumber = thisBubble.activities.iAmOnTheseFeeds[userID].replyNumber
            }

            thisBubble.activities.iAmOnTheseFeeds[userID].seenAndVerified=true
            thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.replied=true
            
        }
        if(path.length === 0){
            replys.push(data)
        } else if(path.length === 1) {
            replys[path[0]].reply.push(data)
        }else if(path.length>1){

            const reply = replys

            let overallRep = [];
            let eachReply = [];

            function buildReply(path){
                let pathClone = [...path]
                if (eachReply.id){
                    let old = {...eachReply}
                    eachReply = {...old.reply[pathClone[0]]}
                }else{
                    eachReply = {...reply[pathClone[0]]}
                }
                overallRep.push(eachReply)
                pathClone.shift()
                // recursion
                if (pathClone.length!==0) {
                    buildReply(pathClone)
                }else{
                    // console.log(overallRep);
                    return
                }
            }

            buildReply(path)
            
            let dR = [...overallRep]
            dR[path.length-1].reply.push(data)
            // Compile Reversal
            let final
            if(path.length===2){
                dR[0].reply[path[1]] = dR[1]
                final = dR[0]
            } else {
                // loop through
                for(let i=dR.length-1; i>0; i=i-1){
                    dR[i-1].reply[path[i]] = dR[i]
                }
                final = dR[0]
            }

            replys[path[0]] = final
        }

        const activity = 'replied'
        if(!thisBubble.activities.lastActivities){
            thisBubble.activities.lastActivities=[]
        }
        const lastActivities = thisBubble.activities.lastActivities
        const activityData = {
            activity,
            userID,
            date: thisDate
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
        
        const newReplys = JSON.stringify(replys)
        const activities = JSON.stringify(thisBubble.activities)
        await bubble.updateOne({postID}, {activities, reply: newReplys}).then(async()=>{
            const notificationData = {
                message: `Reply: ${data.message||''}`
            }
            await ReplyNotifier(notificationData)
            if(creatorID!==userID){
                const thisUserReplies = await userReplies.findOne({userID}).lean()
                if(thisUserReplies===null){
                    const newUserReplies = new userReplies({userID, bubbles: [refDoc]})
                    await newUserReplies.save()
                } else {
                    const allLikesID = []
                    for(let i=0; i<thisUserReplies.bubbles.length; i++){
                        if(dataType(thisUserReplies.bubbles[i])==='object'){
                            allLikesID.push(thisUserReplies.bubbles[i].postID)
                        }
                    }
                    if(!allLikesID.includes(postID)){
                        thisUserReplies.bubbles.push(refDoc)
                        // await thisUserReplies.save()
                        await userReplies.updateOne({userID}, {bubbles: [...thisUserReplies.bubbles]})
                    }
                }
            }
            res.send({successful: true})
        }).catch(()=>{
            res.send({successful: false, message: 'something went wrong when updating bubble, or in the aftermath'})
        })
    } else {
        res.send({successful: false, message: 'data not found'})
    }
}

module.exports = createReply_Old