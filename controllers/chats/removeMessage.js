// const {doc, getDoc, updateDoc, getDocs, collection, setDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const chats = require('../../models/chats')

async function removeMessage(req, res){
    let chatID = req.body.chatID // data.chatID
    let messageID = req.body.messageID // data.chatID
    let userID = req.body.userID // user.id
    let sender = req.body.sender // item.sender
    const {chats} = req.dbModels
    
    try{
        const userChats = await chats.findOne({chatID}).lean()
        if(userChats){
            for(let i=0; i<userChats.messages.length; i++){
                if(userChats.messages[i].messageID===messageID){
                    if(userID!==sender){
                        userChats.messages[i].hideFromRecipient = userID
                        // await userChats.save().then(()=>{
                        await chats.updateOne({chatID}, {messages: userChats.messages}).then(()=>{
                            res.send({successful: true})
                        }).catch(()=>{      
                            res.send({successful: false, message: "unable to save chats"})
                        })
                        break
                    }
                }
            }
        } else {
            res.send({successful: false, message: "chat not found"})
        }
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to remove message'})
    }
}

module.exports = removeMessage