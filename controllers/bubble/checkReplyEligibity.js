const {doc, getDoc, updateDoc, setDoc, deleteField} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
const {database} = require('../../database/firebase')
const Followers = require('../../models/Followers')
// const webPush = require('web-push')

async function checkReplyEligibity(req, res){
    const userID = req.body.userID // user.id
    const replyCreator = req.body.replyCreator // user.id
    const bubbleCreator = req.body.bubbleCreator // user.userInfo.fullname
    const type = req.body.type

    
    if(type==="replyCreator"){
        const replyCreatorFollowers = await Followers.findOne({userID: replyCreator}).lean()
        if(replyCreatorFollowers){
            if(replyCreatorFollowers.followers[userID]){
                res.send({successful: true, pass: true})
            } else {
                res.send({successful: false, pass: false})
            }
        } else {
            res.send({successful: false, pass: false, message: "reply creator followers not found"})
        }
    } else if(type === "mutual"){
        await Followers.findOne({userID: replyCreator}).lean().then(async(replyCreatorFollowersResp)=>{
            if(replyCreatorFollowersResp){
                const bubbleCreatorFollowers = await Followers.findOne({userID: bubbleCreator}).lean()
                if(bubbleCreatorFollowers){
                    if(bubbleCreatorFollowers.followers[userID] && replyCreatorFollowersResp.followers[userID]){
                        res.send({successful: true, pass: true})
                    } else {
                        res.send({successful: false, pass: false, message: "you are not a mutual follower"})
                    }
                } else {
                    res.send({successful: false, pass: false, message: "bubble creator followers not found"})
                }
            } else {
                res.send({successful: false, pass: false, message: "reply creator followers not found"})
            }
        }).catch(()=>{
            res.send({successful: false, pass: false, message: "error from the server"})
        })
    } else {
        res.send({successful: false, pass: false, message: "unknown type"})
    }
}

module.exports = checkReplyEligibity