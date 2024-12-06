// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const User = require('../../models/User')
const { v4: uuidv4 } = require('uuid')

const sendPushNotification_2 = require("../pushNotification/sendPushNotification_2")
const knowledgeBuilder = require('../../utils/knowledgeBuilder')
const knowledgeTypes = require('../../utils/knowledgeTypes')
const updateClipRank = require('../../utils/updateClipRank')
const propagatorAlgorithm = require('../../utils/algorithms/propagatorAlgorithm')
// const sendPushNotification = require('../pushNotification/sendPushNotification')

async function likeClipReply(req, res){
    // const userID = req.body.userID
    // const postID = req.body.postID
    // const replyData = req.body.data
    const {replyID, userID, postID, algorithmInfo, dataID, feedRef, discernUserIdentity, fullname, replyCreatorName, replyPath, parentID} = req.body
    const {cinema, LikeModel, cinemaPair, notifications} = req.dbModels

    async function removeFromLikes(){
        const userLikes = await LikeModel.findOne({userID}).lean()
        if(userLikes){
            const cinema = [...userLikes?.cinema]
            for(let i=0; i<cinema.length; i++){
                const each = cinema[i]
                if(each.postID === postID){
                    cinema.splice(i, 1)
                }
            }
            await LikeModel.updateOne({userID}, {cinema})
        }
    }

    async function addToLikes(){
        const userLikes = await LikeModel.findOne({userID}).lean()
        if(userLikes){
            const cinema = userLikes?.cinema?[...userLikes?.cinema]:[]
            for(let i=0; i<cinema.length; i++){
                const each = cinema[i]
                if(each.postID === postID) return
            }
            cinema.push(feedRef)
            await LikeModel.updateOne({userID}, {cinema})
        }
    }

    async function doNotification(notificationData){
        if(userID!==feedRef.userID){
            function constructCreatorMessage(){
                if(discernUserIdentity){
                    return `someone likes a reply in your clip`
                } else {
                    return `${fullname} likes ${replyCreatorName}'s reply in your clip`
                }
            }
    
            // data
            const creatorData = {
                when: new Date().toISOString(),
                clipID: postID,
                creatorID: feedRef.userID,
                replyPath,
                userID: userID,
                id: uuidv4(),
                message: constructCreatorMessage(),
                identityStatus: discernUserIdentity,
                feed: feedRef,
                type: 'clipReplyLike'
            }
    
            const userNotification = await notifications.findOne({userID: feedRef.userID})
            if(userNotification === null){
                const newUserNotification = new notifications({userID: feedRef.userID, all: [creatorData]})
                newUserNotification.save().catch(()=>{})
            } else {
                userNotification.all.push(creatorData)
                await notifications.updateOne({userID: feedRef.userID}, {all: [...userNotification.all]}).catch(()=>{})
            }

            

            const data = {
                title: `${creatorData.message}`,
                body: notificationData.message,
                // icon: decideNotifyIcon()
                data: {
                    feed: feedRef,
                    type: "clipReplyLike",
                    replyPath,
                    // url: "/main/bubbles/subReply",
                }
            }

            await sendPushNotification_2({
                data, req,
                userIDs: [feedRef.userID]
            })
        }

        if(replyPath.length>1  && (parentID!==userID)){
            
            function constructMainUserMessage(){
                if(discernUserIdentity){
                    return `someone likes your reply`
                } else {
                    return `${fullname} likes your reply`
                }
            }

            const mainReplyData = {
                when: new Date().toISOString(),
                clipID: postID,
                // mainReplier: parentID,
                creatorID: feedRef.userID,
                replyPath,
                userID: userID,
                id: uuidv4(),
                // replyCreatorID: parentID,
                message: constructMainUserMessage(),
                identityStatus: discernUserIdentity,
                feed: feedRef,
                type: 'clipReply'
            }

            const parentNotification = await notifications.findOne({userID: parentID})
            if(parentNotification === null){
                const newParentNotification = new notifications({userID: parentID, all: [mainReplyData]})
                await newParentNotification.save().catch(()=>{})
            } else {
                parentNotification.all.push(mainReplyData)
                await notifications.updateOne({userID: parentID}, {all: [...parentNotification.all]}).catch(()=>{})
            }

            const data = {
                title: `${mainReplyData.message}`,
                body: notificationData.message,
                data: {
                    feed: feedRef,
                    url: "/main/bubbles/subReply",
                    type: "clipReply",
                    replyPath,
                }
            }

            await sendPushNotification_2({
                data, req,
                userIDs: [parentID]
            })
        }
    }

    try {
        const cinemaData = await cinema.findOne({postID}).lean()
        const cinemaDataPair = await cinemaPair.findOne({postID}).lean()

        if(cinemaDataPair && cinemaData){
            const thisRep = cinemaDataPair.allReplys[replyID]
            if(thisRep){
                if(!cinemaDataPair.allReplys[replyID].likes.includes(userID)){
                    cinemaDataPair.allReplys[replyID].likes.push(userID)
                    await cinemaPair.updateOne({postID}, {allReplys: cinemaDataPair.allReplys})
                    const notificationData = { message: thisRep.message }
                    await addToLikes()
                    await doNotification(notificationData)
                } else {
                    const likes = cinemaDataPair.allReplys[replyID].likes
                    for(let i=0; i<likes.length; i++){
                        const current = likes[i]
                        if(current === userID){
                            cinemaDataPair.allReplys[replyID].likes.splice(i, 1)
                            break
                        }
                    }
                    await cinemaPair.updateOne({postID}, {allReplys: cinemaDataPair.allReplys})
                    await removeFromLikes()
                }

                const allReps = Object.values(cinemaDataPair.allReplys)
                let repLikeCount = 0
                for(let i=0; i<allReps.length; i++){
                    const curr = allReps[i]
                    repLikeCount = repLikeCount+curr.likes.length
                }
                // console.log(repLikeCount);

                const cinDt = cinemaData.data
                let index = null
                for(let i=0; i<cinDt.length; i++){
                    const curr = cinDt[i]
                    if(curr.id === dataID){
                        index = i
                        break
                    }
                }

                if(index !== null){
                    cinemaData.data[index].likeCount = repLikeCount
                    await cinema.updateOne({postID}, {data: cinemaData.data})
                }

                const {hash} = feedRef?.metaData || {hash: {}}
                await updateClipRank({which: "likes",  models: req.dbModels, feedRef})
                await knowledgeBuilder({userID, models: req.dbModels, which: knowledgeTypes.like, intent: "hashtags", hash: [...Object.keys(hash)]})

                if(algorithmInfo){
                    const {triggeredEvent, algoType, contentType, algorithm} = algorithmInfo
                    await propagatorAlgorithm({
                        models: req.dbModels, 
                        feedRef,
                        contentType, 
                        algoType, 
                        triggeredEvent,
                        algorithm
                    })
                }
                // likeCount
            }
            
            res.send({successful: true})
        } else {
            res.send({successful: false})
        }
    } catch (e) {
        console.log(e);
        console.log("failed");
        res.send({successful: false, message: 'upload encountered some errors'})
    }

    
    // res.send({successful: true})
}

module.exports = likeClipReply