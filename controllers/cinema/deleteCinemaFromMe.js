// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const Feeds = require('../../models/Feeds')
// const userBubbles = require('../../models/userBubbles')
// const userReplies = require('../../models/userReplies')
// const userShares = require('../../models/userShares')
// const LikeModel = require('../../models/LikeModel')

async function deleteCinemaForMe(req, res){
    const {LikeModel, userShares, userReplies, userCinema, cinemaFeeds} = req.dbModels

    const userID = req.body.userID
    const cinemaData = {...req.body.cinema}
    // console.log(thisBubble.);
    try {
        if(cinemaData.userID!==userID){
            const allUserFeeds = await cinemaFeeds.findOne({userID})
            if(allUserFeeds){
                for(let i=0; i<allUserFeeds.cinema.length; i++){
                    const current = allUserFeeds.cinema[i]
                    if(current.postID === cinemaData.postID){
                        allUserFeeds.cinema.splice(i, 1)
                        // allUserFeeds.cinema[i]='deleted'
                    }
                }
                await cinemaFeeds.updateOne({userID}, {cinema: [...allUserFeeds.cinema]})
            }
            
            const thisUserCinema = await userCinema.findOne({userID})
            if(thisUserCinema){
                for(let i=0; i<thisUserCinema.cinema.length; i++){
                    const current = thisUserCinema.cinema[i]
                    if(current.postID === cinemaData.postID){
                        // thisUserCinema.cinema[i]='deleted'
                        thisUserCinema.cinema.splice(i, 1)
                    }
                }
                await userCinema.updateOne({userID}, {cinema: [...thisUserCinema.cinema]})
            }
    
            const thisUserReplies = await userReplies.findOne({userID})
            if(thisUserReplies){
                for(let i=0; i<thisUserReplies.cinema.length; i++){
                    const current = thisUserReplies.cinema[i]
                    if(current.postID === cinemaData.postID){
                        // thisUserReplies.cinema[i]='deleted'
                        thisUserReplies.cinema.splice(i, 1)
                    }
                }
                await userReplies.updateOne({userID}, {cinema: [...thisUserReplies.cinema]})
            }
    
            // const thisUserLikes = await userLikes.findOne({userID})
            const thisUserLikes = await LikeModel.findOne({userID})
            if(thisUserLikes){
                for(let i=0; i<thisUserLikes.cinema.length; i++){
                    const current = thisUserLikes.cinema[i]
                    if(current.postID === cinemaData.postID){
                        // thisUserLikes.cinema[i]='deleted'
                        thisUserLikes.cinema.splice(i, 1)
                    }
                }
                // await thisUserLikes.save()
                await LikeModel.updateOne({userID}, {cinema: [...thisUserLikes.cinema]})
            }
    
            const thisuserShares = await userShares.findOne({userID})
            if(thisuserShares){
                for(let i=0; i<thisuserShares.cinema.length; i++){
                    const current = thisuserShares.cinema[i]
                    if(current.postID === cinemaData.postID){
                        // thisuserShares.cinema[i]='deleted'
                        thisuserShares.cinema.splice(i, 1)
                    }
                }
                // await thisuserShares.save()
                await userShares.updateOne({userID}, {cinema: [...thisuserShares.cinema]})
            }
    
            res.send({successful: true})
        } else {
            res.send({successful: false, message: 'You cannot remove this bubble'})
        }
    } catch(e){
        res.send({successful: false, message: 'Some error was encountered'})
    }

}

module.exports = deleteCinemaForMe