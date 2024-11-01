// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const User = require('../../models/User')
const { v4: uuidv4 } = require('uuid')

const sendPushNotification_2 = require("../pushNotification/sendPushNotification_2")
const sendPushNotification = require('../pushNotification/sendPushNotification')
const { ref, deleteObject } = require('firebase/storage')
const { storage } = require('../../database/firebase')

async function deleteCinema(req, res){
    const userID = req.body.userID
    const cinemaData = req.body.cinema
    const {cinema, cinemaPair, userCinema, io, cinemaForEveryone} = req.dbModels
    // const settings = cinemaData.settings
    // const secrecySettings = settings.secrecyData


    try {
        const allPaths = []
        const videos = cinemaData.data

        for(let i=0; i<videos.length; i++){
            // allPaths.push(videos[i].path)
            const thisPath = videos[i].path
            if(thisPath){
                const path = thisPath.join('/')
                const fileRef = ref(storage, path);
                await deleteObject(fileRef).then(async()=>{ 
                    if(i===videos.length-1){
                        await deleteThisCinema()
                    }
                }).catch((err)=>{
                    console.log(err);
                    res.send({successful: false, message: 'Server Error: unable to delete files'})
                    return
                })
            }
        }

        if(!videos.length){
            res.send({successful: false, message: "No data"})
            return
        }


        async function deleteThisCinema(){
            await cinema.findOneAndDelete({postID: cinemaData.postID}).then(async()=>{
                await cinemaPair.findOneAndDelete({postID: cinemaData.postID})
                .then(()=>{})
                .catch((e)=>{
                    console.log(e);
                })
                if(io){
                    // io.emit(`cinema-${cinemaData.postID}`, {
                    //     type: "cinema",
                    //     data: {bubbleNotFound: true}
                    // })
                }
                await deleteSomeRefs()
                res.send({successful: true})
            }).catch((e)=>{
                console.log(e);
                res.send({successful: false, message: 'failed to delete bubble'})
            })
        }

        async function deleteSomeRefs(){
            const cinForAll = await cinemaForEveryone.findOne({name: "Everyone"}).lean()
            if(cinForAll){
                for(let i=0; i<cinForAll.cinema.length; i++){
                    const curr = cinForAll.cinema[i]
                    if(curr?.postID === cinemaData.postID){
                        cinForAll.cinema.splice(i, 1)
                        // cinForAll.cinema[i] = "delete"
                    }
                }
            }

            const userCin = await userCinema.findOne({userID}).lean()
            if(userCin){
                const cins = userCin.cinema
                for(let i=0; i<cins.length; i++){
                    const curr = cins[i]
                    if(curr?.postID === cinemaData.postID){
                        curr.splice(i, 1)
                        // curr[i] = "delete"
                    }
                }
            }
        }
    } catch (e) {
        console.log(e);
        console.log("failed to delete");
        res.send({successful: false, message: 'upload encountered some errors'})
    }

    
    // res.send({successful: true})
}

module.exports = deleteCinema