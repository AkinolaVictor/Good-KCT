const {doc, getDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')
const User = require('../../models/User')
const chats = require('../../models/chats')

async function initializeChats(req, res){
    let thisChats = req.body.chats  // thisChats[i].recipient
    let allData = {}
    let success = false

    try{
        for(let i=0; i<thisChats.length; i++){
            await User.findOne({id: thisChats[i].recipient}).lean().then(async(user)=>{
                if(user){
                    let item = {}
                    item.fullname = user.userInfo.fullname
                    item.username = user.userInfo.username
                    item.profilePhoto=user.profilePhotoUrl
                    item.hide=false
                    item.id = thisChats[i].recipient
                    item.chatID = thisChats[i].chatID

                    await chats.findOne({chatID: thisChats[i].chatID}).lean().then((chatData)=>{
                        item.data={...chatData}
                        allData[thisChats[i].chatID] = item
                        success = true
                        item={}
                    }).catch(()=>{
                        // res.send({successful: false, message: "chat not found"})
                    })
                } else {
                    // res.send({successful: false, message: "User not found"})
                }
            }).catch(()=>{
                // res.send({successful: false, message: 'Some error was encourtered at the server side'})
            })
        }
    } catch(e){
        success = false
    } finally {
        if(success){
            res.send({successful: true, allData})
        } else {
            res.send({successful: false, message: 'Server error: unable to get bubbles'})
        }
    }
}

module.exports = initializeChats