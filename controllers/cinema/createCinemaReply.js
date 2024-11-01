// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const User = require('../../models/User')
const { v4: uuidv4 } = require('uuid')

const sendPushNotification_2 = require("../pushNotification/sendPushNotification_2")
const clipReplyCounter = require('../../utils/clipReplyCounter')
const knowledgeBuilder = require('../../utils/knowledgeBuilder')
// const sendPushNotification = require('../pushNotification/sendPushNotification')

async function createCinemaReply(req, res){
    const userID = req.body.userID
    const postID = req.body.postID
    const replyData = req.body.data
    const {
        ifParent,
        dataID, 
        parentReplyID, 
        parentID, 
        discernUserIdentity, 
        fullname, 
        parentName, 
        feedRef,
        replyPath,
        // dataIndex
    } = req.body
    
    // const dataIndex = req.body.dataIndex

    const {cinema, cinemaPair, notifications, userReplies} = req.dbModels

    async function updateUserReplies(){
        const userReps = await userReplies.findOne({userID}).lean()
        if(userReps){
            const cinema = userReps?.cinema?[...userReps?.cinema]:[]
            for(let i=0; i<cinema.length; i++){
                const each = cinema[i]
                if(each.postID === postID) return
            }
            cinema.push(feedRef)
            await userReplies.updateOne({userID}, {cinema})
        }
    }
    
    const replyCounter = clipReplyCounter
    // function replyCounter({allReplys, initialReplys}){
    //     const initRep = [...initialReplys]
    //     let replyCount = initRep.length
    //     function counter(parents){
    //         if(!parents.length) return
    //         const parentClone = [...parents]
    //         for(let i=0; i<parentClone.length; i++){
    //           if(allReplys[parentClone[i]]){
    //             const each = allReplys[parentClone[i]].childReplys
    //             replyCount+=each.length
    //             if(each.length){
    //                 counter(each)
    //             }
    //           }
    //         }
    //     }
        
    //     counter(initRep)
    //     return replyCount
    // }

    async function doNotification(notificationData){
        if(userID!==feedRef.userID){
            function constructCreatorMessage(){
                if(discernUserIdentity){
                    if(!ifParent){
                        return `Someone replied your clip`
                    } else {
                        return `A reply was replied in your clip`
                    }
                } else {
                    if(!ifParent){
                        return `${fullname} replied your clip`
                    } else {
                        return `${fullname} replied to ${parentName}`
                    }
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
                type: 'clipReply'
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
                    url: "/main/bubbles/subReply",
                    type: "clipReply",
                    replyPath,
                }
            }

            await sendPushNotification_2({
                data, req,
                userIDs: [feedRef.userID]
            })
        }

        if(ifParent  && (parentID!==userID) && (userID!==feedRef.userID)){
            
            function constructMainUserMessage(){
                if(discernUserIdentity){
                    return `Someone replied you`
                } else {
                    return `${fullname} replied you`
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
            let index = null
            const dat = cinemaData.data
            for(let i=0; i<dat.length; i++){
                if(dat[i].id === dataID){
                    index = i
                    break
                }
            }

            const analytics = cinemaDataPair.analytics||{}
            const newAnal = {
                userID,
                num: Object.keys(analytics).length+1
            }

            if(analytics[userID]){
                replyData.replyNumber = analytics[userID].num
            } else {
                replyData.replyNumber = newAnal.num
            }

            if(!ifParent){
                cinemaDataPair.initRep[dataID].push(replyData.id)
            } else {
                cinemaDataPair.allReplys[parentReplyID].childReplys.push(replyData.id)
            }
            
            cinemaDataPair.allReplys[replyData.id] = replyData
            if(index!==null){
                cinemaData.data[index].replyCount = replyCounter({
                    allReplys: cinemaDataPair.allReplys,
                    initialReplys: cinemaDataPair.initRep[dataID]
                })
            }
            
            const updates = {
                allReplys: cinemaDataPair.allReplys, 
                initRep: cinemaDataPair.initRep,
            }

            if(!analytics[userID]){
                analytics[userID] = newAnal
                updates.analytics = analytics
            }

            await cinema.updateOne({postID}, {data: cinemaData.data})
            await cinemaPair.updateOne({postID}, {...updates})
            // analytics
            const notificationData = { message: replyData.message }
            await updateUserReplies()
            await doNotification(notificationData)

            const {hash} = feedRef?.metaData || {hash: {}}
            await knowledgeBuilder({userID, models: req.dbModels, which: "replys", intent: "hashtags", hash: [...Object.keys(hash)]})
            
            res.send({successful: true})
        }
    } catch (e) {
        console.log(e);
        console.log("failed");
        res.send({successful: false, message: 'upload encountered some errors'})
    }

    
    // res.send({successful: true})
}

module.exports = createCinemaReply