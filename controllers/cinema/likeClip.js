
// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const User = require('../../models/User')

// const sendPushNotification_2 = require("../pushNotification/sendPushNotification_2")
// const sendPushNotification = require('../pushNotification/sendPushNotification')
// const { ref, deleteObject } = require('firebase/storage')
// const { v4: uuidv4 } = require('uuid')
// const { storage } = require('../../database/firebase')


async function likeClip(req, res){
    const {cinema, cinemaPair, userCinema, cinemaFeeds, hashTags, allUser, notifications, Followers, io, cinemaForEveryone} = req.dbModels

    const userID = req.body.userID
    const postID = req.body.postID
    const dataID = req.body.dataID
    const feedRef = req.body.feedRef
    const fullname = req.body.fullname
    const discernUserIdentity = req.body.discernUserIdentity


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
                feed: feedRef,
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
                    feed: feedRef,
                    url: "/main/bubbles/subReply",
                    type: "clipReply",
                    // replyPath,
                }
            }

            await sendPushNotification_2({
                data, req,
                userIDs: [feedRef.userID]
            })
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
                    await notifyCreator()
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