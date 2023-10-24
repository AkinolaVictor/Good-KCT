// const {doc, getDoc, updateDoc, getDocs, collection, setDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const chats = require('../../models/chats')

async function seenMessage(req, res){
    let chatID = req.body.chatID // data.chatID
    let userID = req.body.userID // data.chatID
    const {chats} = req.dbModels
    
    try{
        const usersChat = await chats.findOne({chatID}).lean()
        if(usersChat){
            let updatedSeen = false
            for(let i=0; i<usersChat.messages.length; i++){
                if(usersChat.messages[i].sender!==userID){
                    if(usersChat.messages[i].seen===false){
                        usersChat.messages[i].seen=true
                        updatedSeen = true
                    }
                }
            }
            if(updatedSeen){
                // await usersChat.save()
                await chats.updateOne({chatID}, {messages: usersChat.messages})
            }
            res.send({successful: true})
        } else {
            res.send({successful: false, message: 'Unable to send chat, chat not found'})
        }
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to send chat'})
    }
}

module.exports = seenMessage