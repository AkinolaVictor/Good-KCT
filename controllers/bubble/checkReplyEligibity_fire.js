const {doc, getDoc, updateDoc, setDoc, deleteField} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
const {database} = require('../../database/firebase')
// const webPush = require('web-push')

async function checkReplyEligibity(req, res){
    const userID = req.body.userID // user.id
    const replyCreator = req.body.replyCreator // user.id
    const bubbleCreator = req.body.bubbleCreator // user.userInfo.fullname
    const type = req.body.type
    
    // console.log("called");
    const replyCreatorRef = doc(database, 'followers', replyCreator)
    const bubbleCreatorRef = doc(database, 'followers', bubbleCreator)
    await getDoc(replyCreatorRef).then(async(docsnap)=>{
        if(docsnap.exists()){
            return {
                replyCreator:{...docsnap.data()},
                bubbleCreator: {}
            }
        } else {
            return {
                replyCreator: {},
                bubbleCreator: {}
            }
        }
    }).then(async(result)=>{
        if(type==="replyCreator"){
            return result
        } else if(type === "mutual"){
            let returnValue = {...result}
            await getDoc(bubbleCreatorRef).then(async(docsnap)=>{
                if(docsnap.exists()){
                    returnValue.bubbleCreator = {...docsnap.data()}
                }
            }).catch(()=>{
                // returnValue = re
            })
            return returnValue 
        } else {
            return result
        }
    }).then((result)=>{
        if(type==="replyCreator"){
            if(result.replyCreator[userID]){
                res.send({successful: true, pass: true})
            } else {
                res.send({successful: false, pass: false})
            }
        } else if(type==="mutual"){
            if(result.replyCreator[userID] && result.bubbleCreator[userID]){
                res.send({successful: true, pass: true})
            } else {
                res.send({successful: false, pass: false})
            }
        } else {
            res.send({successful: false, pass: false})
        }
    }).catch(()=>{
        res.send({successful: false})
    })
}

module.exports = checkReplyEligibity