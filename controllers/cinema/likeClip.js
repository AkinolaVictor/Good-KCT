
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
// const { v4: uuidv4 } = require('uuid')
// const { storage } = require('../../database/firebase')


async function likeClip(req, res){
    const {cinema, LikeModel, notifications, Followers, io, cinemaForEveryone} = req.dbModels

    const userID = req.body.userID
    const postID = req.body.postID
    const dataID = req.body.dataID
    // const dataIndex = req.body.dataIndex
    const feedRef = req.body.feedRef
    const fullname = req.body.fullname
    const discernUserIdentity = req.body.discernUserIdentity
    const modifiedFeed = {
        ...feedRef,
        dataID,
        // dataIndex
    }

    async function notifyCreator(){
        if(userID!==feedRef.userID){

            function constructCreatorMessage(){
                if(discernUserIdentity){
                    return `Someone likes your clip`
                } else {
                    return `${fullname} likes your clip`
                }
            }
    
            // data
            const creatorData = {
                when: new Date().toISOString(),
                clipID: postID,
                creatorID: feedRef.userID,
                // replyPath,
                userID: userID,
                id: uuidv4(),
                message: constructCreatorMessage(),
                identityStatus: discernUserIdentity,
                feed: modifiedFeed,
                type: 'clipLike'
            }
    
            const userNotification = await notifications.findOne({userID: feedRef.userID})
            if(userNotification === null){
                const newUserNotification = new notifications({userID: feedRef.userID, all: [creatorData]})
                await newUserNotification.save().catch(()=>{})
            } else {
                userNotification.all.push(creatorData)
                await notifications.updateOne({userID: feedRef.userID}, {all: [...userNotification.all]}).catch(()=>{})
            }

            

            const data = {
                title: `${creatorData.message}`,
                // body: notificationData.message,
                // icon: decideNotifyIcon()
                data: {
                    feed: modifiedFeed,
                    type: "clipLike",
                    // url: "/main/bubbles/subReply",
                    // replyPath,
                }
            }

            await sendPushNotification_2({
                data, req,
                userIDs: [feedRef.userID]
            })
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

    try {
        let thisClip = await cinema.findOne({postID}).lean()

        if(thisClip){
            let index = null
            const clipLikes = thisClip.data
            for(let i=0; i<clipLikes.length; i++){
                const curr = clipLikes[i]
                if(curr.id === dataID){
                    index = i
                    break
                }
            }
            
            if(index!==null){
                const likes = thisClip.data[index]?.likes||{}
                if(!likes[userID]){
                    if(thisClip.data[index]?.likes){
                        thisClip.data[index].likes[userID] = true
                    } else {
                        thisClip.data[index].likes = {[userID]: true}
                    }
                    // await cinema.findOneAndUpdate({postID}, {data: thisClip.data})
                    await cinema.updateOne({postID}, {data: thisClip.data})
                    await addToLikes()
                    await notifyCreator()
                    const {hash} = feedRef?.metaData || {hash: {}}
                    await updateClipRank({which: "likes",  models: req.dbModels, feedRef})
                    await knowledgeBuilder({userID, models: req.dbModels, which: knowledgeTypes.like, intent: "hashtags", hash: [...Object.keys(hash)]})
                }
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

module.exports = likeClip