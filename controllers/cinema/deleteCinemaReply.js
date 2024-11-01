// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const User = require('../../models/User')
const { v4: uuidv4 } = require('uuid')

const sendPushNotification_2 = require("../pushNotification/sendPushNotification_2")
const sendPushNotification = require('../pushNotification/sendPushNotification')
const { ref, deleteObject } = require('firebase/storage')
const { storage } = require('../../database/firebase')
const clipReplyCounter = require('../../utils/clipReplyCounter')

async function deleteCinemaReply(req, res){
    const {userID, postID, dataID, replyID, lastParentReply} = req.body
    const {cinema, cinemaPair, userCinema, io, cinemaForEveryone} = req.dbModels
    // const settings = cinemaData.settings
    // const secrecySettings = settings.secrecyData

    const replyCounter = clipReplyCounter

    try {
        const cinemaData = await cinema.findOne({postID}).lean()
        const cinemaDataPair = await cinemaPair.findOne({postID}).lean()

        if(cinemaData && cinemaDataPair){
            let index = null
            const dat = cinemaData.data
            for(let i=0; i<dat.length; i++){
                if(dat[i].id === dataID){
                    index = i
                    break
                }
            }

            const allReplys = cinemaDataPair.allReplys
            if(allReplys[replyID]){
                if(allReplys[replyID].userID !== userID){
                    res.send({successful: false, message: 'Reply not found'})
                    return
                }

                if(allReplys[replyID].childReplys.length){
                    allReplys[replyID].message = "!***DELETED***!"
                    allReplys[replyID].deleted = true
                } else {
                    if(lastParentReply){
                        const childOfLast = allReplys[lastParentReply]?.childReplys
                        if(childOfLast){
                            for(let i=0; i<childOfLast.length; i++){
                                const currID = childOfLast[i]
                                if(currID === replyID){
                                    allReplys[lastParentReply].childReplys.splice(i, 1)
                                }
                            }
                        }
                    }
                    delete allReplys[replyID]
                }
            } else {
                res.send({successful: false, message: 'Reply not found'})
                return
            }

            const initRep = cinemaDataPair.initRep
            if(initRep[dataID] && allReplys[replyID]?.childReplys?.length===0){
                for(let i=0; i<initRep[dataID].length; i++){
                    const currentID = initRep[dataID][i]
                    if(currentID === replyID){
                        initRep[dataID].splice(i, 1)
                    }
                }
            }

            
            if(index!==null){
                cinemaData.data[index].replyCount = replyCounter({
                    allReplys: allReplys,
                    initialReplys: initRep[dataID]
                })

                await cinema.updateOne({postID}, {data: cinemaData.data})
                await cinemaPair.updateOne({postID}, {initRep, allReplys})
            }
        }
        res.send({successful: true})
    } catch (e) {
        console.log(e);
        console.log("failed to delete");
        res.send({successful: false, message: 'Encountered some errors at the server'})
    }

}

module.exports = deleteCinemaReply