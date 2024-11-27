
// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const User = require('../../models/User')

const knowledgeBuilder = require("../../utils/knowledgeBuilder")
const knowledgeTypes = require("../../utils/knowledgeTypes")
const updateClipRank = require("../../utils/updateClipRank")
const sendPushNotification_2 = require("../pushNotification/sendPushNotification_2")

// const sendPushNotification_2 = require("../pushNotification/sendPushNotification_2")
// const sendPushNotification = require('../pushNotification/sendPushNotification')
// const { ref, deleteObject } = require('firebase/storage')
const { v4: uuidv4 } = require('uuid')
// const { storage } = require('../../database/firebase')


async function shareClip(req, res){
    const {cinema, userShares, cinemaFeeds, notifications, Followers} = req.dbModels

    const userID = req.body.userID
    const postID = req.body.postID
    const feedRef = req.body.feedRef

    const fullname = req.body.fullname
    const discernUserIdentity = req.body.discernUserIdentity
    const shareSettings = req.body.shareData


    async function ShareNotifier(){
        if(userID!==feedRef.userID){
            // check if 
            try{
                const shareData = {
                    when: new Date().toISOString(),
                    cinemaID: feedRef.postID,
                    creatorID: feedRef.userID,
                    userID,
                    id: uuidv4(),
                    message: `${discernUserIdentity?'someone':fullname} shared your bubble`,
                    identityStatus: discernUserIdentity,
                    feed: feedRef,
                    type: 'clipShare'
                }
                
                const creatorNotifications = await notifications.findOne({userID: feedRef.userID})
                if(creatorNotifications === null){
                    const newNotif = new notifications({userID: feedRef.userID, all: [shareData]})
                    await newNotif.save()
                } else {
                    creatorNotifications.all.push(shareData)
                    await notifications.updateOne({userID: feedRef.userID}, {all: [...creatorNotifications.all]})
                }

                const data = {
                    title: `${`${discernUserIdentity?'someone':fullname} shared your clip`}`,
                    // body: notificationData.message,
                    data: {
                        type: "clipShare",
                        feed: feedRef
                    }
                }
                
                await sendPushNotification_2({
                    data, req,
                    userIDs: [feedRef.userID]
                })
            } catch (e){
                // DO NOTHING
            }
        }
    }

    async function directlyShareClip(){
        try {
            let thisClip = await cinema.findOne({postID}).lean()
    
            if(thisClip){
                
                const shares = thisClip?.allShares||[]
                if(!shares.includes(userID)){
                    shares.push(userID)
                    await cinema.updateOne({postID}, {allShares: shares})
                    const userFollowers = await Followers.findOne({userID}).lean()
                    const fflArr = Object.keys(userFollowers.followers)
    
                    for(let i=0; i<fflArr.length; i++){
                        const each = fflArr[i]
                        const userCinFeed = await cinemaFeeds.findOne({userID: each})
                        if(userCinFeed){
                            userCinFeed.cinema.push(feedRef)
                            await cinemaFeeds.updateOne({userID: each}, {cinema: userCinFeed.cinema})
                        }
                    }

                    await updateUserShares()
                    await ShareNotifier()
                }
                res.send({successful: true})
            } else {
                console.log("failed");
                res.send({successful: false, message: 'server error'})
            }
        } catch (e) {
            console.log(e);
            console.log("failed");
            res.send({successful: false, message: 'problem encountered'})
        }
    }

    async function updateUserShares(){
        const userReps = await userShares.findOne({userID}).lean()
        if(userReps){
            const cinema = userReps?.cinema?[...userReps?.cinema]:[]
            for(let i=0; i<cinema.length; i++){
                const each = cinema[i]
                if(each.postID === postID) return
            }
            cinema.push(feedRef)
            await userShares.updateOne({userID}, {cinema})
        }
    }

    async function sendShareRequest(){
        if(userID !== feedRef.userID){
            
            // data
            const shareRequestData = {
                when: new Date().toISOString(),
                clipID: feedRef.postID,
                creatorID: feedRef.userID,
                userID: userID,
                id: uuidv4(),
                status: 'undefined',
                message: `${discernUserIdentity?'someone':fullname} requests your permission to share this clip`,
                identityStatus: discernUserIdentity,
                feed: feedRef,
                type: 'clipShareRequest'
            }
    
            // check if 
            try {
                const thisClip = await cinema.findOne({postID: feedRef.postID}).lean()
                if(thisClip){
                    if(typeof thisClip.sharePermission === "number"){
                        thisClip.sharePermission++
                        await cinema.updateOne({postID: feedRef.postID}, {sharePermission: thisClip.sharePermission})
                    }
                }
                const creatorNotification = await notifications.findOne({userID: feedRef.userID})
                if(creatorNotification === null){
                    const newNotif = new notifications({userID: feedRef.userID, all: [shareRequestData]})
                    await newNotif.save()
                } else {
                    creatorNotification.all.push(shareRequestData)
                    await notifications.updateOne({userID: feedRef.userID}, {all: [...creatorNotification.all]})
                }
                const data = {
                    title: `${shareRequestData.message}`,
                    // body: `${notificationMessage}`,
                    data: {
                        type: "clipShare",
                        feed: feedRef
                    }
                }

                // await sendPushNotification(thisBubble.userID, data, req)

                await sendPushNotification_2({
                    data, req,
                    userIDs: [feedRef.userID]
                })
                
                res.send({successful: true})
            } catch(e){
                res.send({successful: false})
                // DO NOTHING
            }
        }
    }

    function checkSharePermission(value){
        if(shareSettings.sharePermission === value){
            return true
        }

        if(shareSettings.sharePermission.value === value){
            return true
        }

        return false
    }

    async function initShare(){
        const {hash} = feedRef?.metaData || {hash: {}}
        await updateClipRank({which: "shares",  models: req.dbModels, feedRef})
        await knowledgeBuilder({userID, models: req.dbModels, which: knowledgeTypes.share, intent: "hashtags", hash: [...Object.keys(hash)]})

        if(feedRef.userID===userID){
            // await directlyShareClip()
            res.send({successful: false})
        } else {
            if(checkSharePermission('Request permission for all')){
                await sendShareRequest()
            } else if(checkSharePermission('Request permission for specific people')){
                const selected = shareSettings.sharePermission.data
                if(selected[userID]){
                    await sendShareRequest()
                } else {
                    await directlyShareClip()
                }
            } else if(checkSharePermission('Request permission for all, except')){
                const selected = shareSettings.sharePermission.data
                if(selected[userID]){
                    await directlyShareClip()
                } else {
                    await sendShareRequest()
                }
            } else if(checkSharePermission('Request permission only for followers') || checkSharePermission('Request permission only for non-followers')){
                const creatorFollowers = await Followers.findOne({userID: feedRef.userID}).lean()
                if(creatorFollowers){
                    if(checkSharePermission('Request permission only for followers')){
                        if(creatorFollowers.followers[userID]){
                            await sendShareRequest()
                        } else {
                            await directlyShareClip()
                        }
                    } else if(checkSharePermission('Request permission only for non-followers')){
                        if(!creatorFollowers.followers[userID]){
                            await sendShareRequest()
                        } else {
                            await directlyShareClip()
                        }
                    }else {
                        // do nothing
                    }
                }
            } else {
                await directlyShareClip()
            }
        }
    }

    await initShare()

}

module.exports = shareClip