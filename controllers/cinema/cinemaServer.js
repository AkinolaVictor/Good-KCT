// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const User = require('../../models/User')
// const { v4: uuidv4 } = require('uuid')

// const sendPushNotification_2 = require("../pushNotification/sendPushNotification_2")
// const sendPushNotification = require('../pushNotification/sendPushNotification')
// const { ref, deleteObject } = require('firebase/storage')
// const { storage } = require('../../database/firebase')

async function cinemaServer(req, res){
    const {cinemaForEveryone, cinemaFeeds} = req.dbModels

    const userID = req.body.userID
    const seen = req.body.seen||[]
    const where = req.body.where
    const interactions = req.body.interactions
    const count = req.body.count||20


    try {
        let clipRefs = []
        if(where==="for all"){
            const allCinema = await cinemaForEveryone.findOne({name: "Everyone"}).lean()
            const allCinRefs = [...allCinema.cinemaRefs].reverse()
            if(allCinema) clipRefs = [...clipRefs, ...allCinRefs]
        }
        
        if(where==="following"){
            const cinFeed = await cinemaFeeds.findOne({userID}).lean()
            const cinFeedRefs = [...cinFeed.cinema].reverse()
            if(cinFeed) clipRefs=[...clipRefs, ...cinFeedRefs]
        }
        
        if(where==="aos"){
            const allCinema = await cinemaForEveryone.findOne({name: "Everyone"}).lean()
            const allCinRefs = [...allCinema.cinemaRefs].reverse()
            if(allCinema) clipRefs = [...clipRefs, ...allCinRefs]

            const cinFeed = await cinemaFeeds.findOne({userID}).lean()
            const cinFeedRefs = [...cinFeed.cinema].reverse()
            if(cinFeed) clipRefs=[...clipRefs, ...cinFeedRefs]
        }

        const stored = []
        const tracker = []
        if(clipRefs.length){
            // const {cinemaRefs} = allCinema
            for(let i=0; i<clipRefs.length; i++){
                const curr = clipRefs[i]
                const {postID, metaData} = curr||{}
                const {audience, aos} = metaData

                if(!tracker.includes(postID)){
                    tracker.push(postID)
                }

                const basicViewEligibity = audience["Everyone"] || audience[userID]
                const clipIsAos = aos !== "None"
                if(basicViewEligibity){
                    if(!seen.includes(postID)){
                        if(where==="aos"){
                            if(clipIsAos){
                                stored.push(curr)
                            }
                        } else {
                            stored.push(curr)
                        }
                    }
                }

                if(stored.length>=count){
                    break
                }
            }
        }
        res.send({successful: true, cinema: stored})
    } catch (e) {
        console.log(e);
        console.log("failed");
        res.send({successful: false, message: 'upload encountered some errors'})
    }
}

module.exports = cinemaServer