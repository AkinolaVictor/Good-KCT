// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const User = require('../../models/User')
const { v4: uuidv4 } = require('uuid')

const sendPushNotification_2 = require("../pushNotification/sendPushNotification_2")
const sendPushNotification = require('../pushNotification/sendPushNotification')
const { ref, deleteObject } = require('firebase/storage')
const { storage } = require('../../database/firebase')

async function cinemaServer(req, res){
    const {cinema, userCinema, cinemaFeeds, hashTags, allUser, notifications, Followers, io, cinemaForEveryone} = req.dbModels

    const userID = req.body.userID
    const seen = req.body.seen||[]
    const where = req.body.where
    const interactions = req.body.interactions
    const count = req.body.count||20


    try {
        const allCinema = await cinemaForEveryone.findOne({name: "Everyone"}).lean()
        if(allCinema){
            const {cinemaRefs} = allCinema
            const stored = []

            for(let i=0; i<cinemaRefs.length; i++){
                const curr = cinemaRefs[i]
                const {postID, metaData} = curr||{}
                const {audience} = metaData

                const basicViewEligibity = audience["Everyone"] || audience[userID]
                if(basicViewEligibity){
                    if(!seen.includes(postID)){
                        stored.push(curr)
                    }
                }

                if(stored.length>=count){
                    break
                }
            }
            res.send({successful: true, cinema: stored})
        }
    } catch (e) {
        console.log(e);
        console.log("failed");
        res.send({successful: false, message: 'upload encountered some errors'})
    }
}

module.exports = cinemaServer