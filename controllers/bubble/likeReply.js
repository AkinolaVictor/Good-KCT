const { v4: uuidv4 } = require('uuid')
const date = require('date-and-time')
const sendPushNotification = require('../pushNotification/sendPushNotification')
const sendPushNotification_2 = require('../pushNotification/sendPushNotification_2')
const knowledgeBuilder = require('../../utils/knowledgeBuilder')
// const {doc, getDoc, updateDoc, setDoc, increment} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const notifications = require('../../models/notifications')
// const bubble = require('../../models/bubble')

async function likeReply(req, res){
    const {notifications, bubble, eachUserAnalytics} = req.dbModels

    const bubbleID = req.body.bubbleID
    const userIcon = req.body.userIcon // user.id
    const bubbleCreator = req.body.bubbleCreator
    const userID = req.body.userID
    const path = req.body.path // props.path
    const fullname = req.body.userFullname
    const replyCreatorName = req.body.replyCreatorName
    const refDoc = req.body.refDoc
    const hideIdentity = req.body.hideIdentity
    const secrecySettings = req.body.secrecySettings
    const replyCreatorID = req.body.replyCreatorID
    const replyDataID = req.body.replyDataID
    
    // remove from audience
    let overallRep = []
    let eachReply = []

    function buildReply(path, reply){
        let pathClone = [...path]
        if (eachReply.id){
            let old = {...eachReply}
            eachReply = {...old.reply[pathClone[0]]}
        }else{
            eachReply = {...reply[pathClone[0]]}
        }
        overallRep.push(eachReply)
        pathClone.shift()
        // recurrsion
        if (pathClone.length!==0) {
            buildReply(pathClone, reply)
        }
    }

    function discernUserIdentity(){
        if(hideIdentity){
            return true
        }

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

    async function LikeReplyNotifier(notificationData){
        
        if(userID!==bubbleCreator && userID!==replyCreatorID){
            function constructCreatorMessage(){
                if(discernUserIdentity()){
                    return `someone likes a reply in your bubble`
                } else {
                    return `${fullname} likes ${replyCreatorName}'s reply in your bubble`
                }
            }

            // data
            const creatorData = {
                // time: getDate(),
                when: new Date().toISOString(),
                bubbleID,
                creatorID: bubbleCreator,
                userID,
                id: uuidv4(),
                message: constructCreatorMessage(),
                identityStatus: discernUserIdentity(),
                feed: refDoc,
                replyPath: [...path],
                type: 'reply'
            }
            
            creatorData.feed.env='feed'

            // update creator
            const creatorNotification = await notifications.findOne({userID: bubbleCreator})
            if(creatorNotification === null){
                const newNotif = new notifications({userID: bubbleCreator, all: [creatorData]})
                await newNotif.save()
            } else {
                creatorNotification.all.push(creatorData)
                // await creatorNotification.save()
                await notifications.updateOne({userID: bubbleCreator}, {all: [...creatorNotification.all]})
            }

            const data = {
                title: `${creatorData.message}`,
                body: notificationData.message,
                data: {
                    type: "reply",
                    feed: refDoc,
                    replyPath: [...path]
                }

            }

            await sendPushNotification(bubbleCreator, data, req)

            await sendPushNotification_2({
                data, req,
                userIDs: [bubbleCreator]
            })
        }


        // update user
        if(path.length>1 && replyCreatorID!==bubbleCreator){
            function constructMainUserMessage(){
                if(discernUserIdentity()){
                    return `someone likes your reply`
                } else {
                    return `${fullname} likes your reply`
                }
            }

            const mainReplyData = {
                // time: getDate(),
                when: new Date().toISOString(),
                bubbleID: bubbleID,
                mainReplier: replyDataID,
                creatorID: bubbleCreator,
                id: uuidv4(),
                userID: userID,
                replyCreatorID,
                message: constructMainUserMessage(),
                identityStatus: discernUserIdentity(),
                feed: refDoc,
                replyPath: [...path],
                type: "reply"
            }
            mainReplyData.feed.env='feed'

            const mainUserNotification = await notifications.findOne({userID: replyCreatorID})
            if(mainUserNotification === null){
                const newNotif = new notifications({userID: replyCreatorID, all: [mainReplyData]})
                await newNotif.save()
            } else {
                mainUserNotification.all.push(mainReplyData)
                // await mainUserNotification.save()
                await notifications.updateOne({userID: replyCreatorID}, {all: [...mainUserNotification.all]})
            }
            
            const data = {
                title: `${mainReplyData.message}`,
                body: notificationData.message,
                data: {
                    type: "reply",
                    feed: refDoc,
                    replyPath: [...path]
                }
            }
            
            // await sendPushNotification(replyCreatorID, data, req)

            await sendPushNotification_2({
                data, req,
                userIDs: [replyCreatorID]
            })
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

    try {
        const thisBubble = await bubble.findOne({postID: bubbleID}).lean()
        if(thisBubble === null){
            res.send({successful: false, message: 'Bubble not found'})
        } else {
            let replys = thisBubble.reply
            if(typeof(thisBubble.reply) === "string"){
                replys = JSON.parse(thisBubble.reply)
            }
            // const newReplyPath = [...path]
            buildReply(path, replys)
            // destructured replies
            let dR = [...overallRep]
            // add like if its absent
            const message = dR[dR.length-1].message||''
            if(!(dR[dR.length-1].like.includes(userID))){
                dR[dR.length-1].like.push(userID)
            }
            let final;
            // loop through path and create final
            for(let i=path.length-1; i>0; i=i-1){
                dR[i-1].reply[path[i]] = dR[i]
            }
            final = dR[0]

            replys[path[0]] = final;
            const reply = JSON.stringify(replys)
            // const totalLikes = thisBubble.totalLikes + 1
            await bubble.updateOne({postID: bubbleID}, {reply}).then(async()=>{
                const notificationData = {
                    message: `${message}`
                }
                await LikeReplyNotifier(notificationData)
                await updateUserAnalytics(thisBubble)
                const {hash} = refDoc?.metaData || {hash: {}}
                await knowledgeBuilder({userID, models: req.dbModels, which: "likes", intent: "hashtags", hash: [...Object.keys(hash)]})
            }).catch(()=>{
            })

            res.send({successful: true})
        }
    } catch (e){
        res.send({successful: false, message: 'An error occured from the server side'})
    }
    
}

module.exports = likeReply