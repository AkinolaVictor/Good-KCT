// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const User = require('../../models/User')
// const { v4: uuidv4 } = require('uuid')

// const sendPushNotification_2 = require("../pushNotification/sendPushNotification_2")
// const sendPushNotification = require('../pushNotification/sendPushNotification')
// const { ref, deleteObject } = require('firebase/storage')
// const { storage } = require('../../database/firebase')

async function getClipPair(req, res){
    const {cinemaPair} = req.dbModels

    const postID = req.body.postID
    // const userID = req.body.userID
    // const where = req.body.where
    // const interactions = req.body.interactions
    // const count = req.body.count||20


    try {
        const cinPair = await cinemaPair.findOne({postID}).lean()
        if(cinPair){
            res.send({successful: true, cinema: {...cinPair}})
        } else {
            res.send({successful: false, message: "Not found"})
        }
    } catch (e) {
        console.log(e);
        console.log("failed");
        res.send({successful: false, message: 'upload encountered some errors'})
    }
}

module.exports = getClipPair