// const {doc, getDoc, updateDoc, getDocs, collection, setDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const chats = require('../../models/chats')

async function deleteMessage(req, res){
    const {chats} = req.dbModels
    
    let chatID = req.body.chatID // data.chatID
    let messageID = req.body.messageID // data.chatID
    
    try{
        const userChats = await chats.findOne({chatID})
        if(userChats){
            for(let i=0; i<userChats.messages.length; i++){
                if(userChats.messages[i].messageID===messageID){
                    userChats.messages.splice(i, 1)
                    await chats.updateOne({chatID}, {messages: [...userChats.messages]}).then(()=>{
                    // await userChats.save().then(()=>{
                        res.send({successful: true})
                    }).catch(()=>{
                        res.send({successful: false, message: 'Unable to delete message'})
                    })
                    break
                }
            }
        } else {
            res.send({successful: false, message: 'Chat not found'})
        }
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to delete message'})
    }
}

module.exports = deleteMessage