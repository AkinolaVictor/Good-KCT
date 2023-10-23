const {doc, getDoc, updateDoc, getDocs, collection, setDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')
const chats = require('../../models/chats')

async function sendMessage(req, res){
    let chatID = req.body.chatID // data.chatID
    let chatData = req.body.chatData //chatData
    
    try{
        const userChats = await chats.findOne({chatID})
        if(userChats){
            userChats.messages.push(chatData)
            await chats.updateOne({chatID}, {messages: [...userChats.messages]}).then(()=>{
            // await userChats.save().then(()=>{
            // const messages = userChats.messages
            // await chats.updateOne({chatID}, {messages}).then(()=>{
                res.send({successful: true})
            }).catch(()=>{
                res.send({successful: false, message: 'Unable to save chat', text: chatData.message})
            })
        } else {
            res.send({successful: false, message: 'Chat not found', text: chatData.message})
        }
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to send chat', text: chatData.message})
    }
}

module.exports = sendMessage