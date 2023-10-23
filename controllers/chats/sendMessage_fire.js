const {doc, getDoc, updateDoc, getDocs, collection, setDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function sendMessage(req, res){
    let chatID = req.body.chatID // data.chatID
    let chatData = req.body.chatData //chatData
    
    try{
        const userChatsRef = doc(database, "chats", chatID)
        await getDoc(userChatsRef).then(async (snapshot)=>{
            const messages = [...snapshot.data().messages]
            messages.push(chatData)
            await updateDoc(userChatsRef, {messages})
        }).then(()=>{
            res.send({successful: true})
        }).catch(()=>{
            res.send({successful: false, message: 'Unable to send chat', text: chatData.message})
        })
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to send chat', text: chatData.message})
    }
}

module.exports = sendMessage