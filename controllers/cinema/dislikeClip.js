
// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const User = require('../../models/User')

// const sendPushNotification_2 = require("../pushNotification/sendPushNotification_2")
// const sendPushNotification = require('../pushNotification/sendPushNotification')
// const { ref, deleteObject } = require('firebase/storage')
// const { v4: uuidv4 } = require('uuid')
// const { storage } = require('../../database/firebase')


async function dislikeClip(req, res){
    const {cinema, LikeModel} = req.dbModels

    const userID = req.body.userID
    const postID = req.body.postID
    const dataID = req.body.dataID
    // const count = req.body.count
    // const where = req.body.where
    // const interactions = req.body.interactions

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
                if(likes[userID]){
                    delete thisClip.data[index].likes[userID]
                    await cinema.findOneAndUpdate({postID}, {data: thisClip.data})
                    await removeFromLikes()
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

module.exports = dislikeClip