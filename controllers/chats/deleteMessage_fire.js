const {doc, getDoc, updateDoc, getDocs, collection, setDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function deleteMessage(req, res){
    let chatID = req.body.chatID // data.chatID
    let messageID = req.body.messageID // data.chatID
    
    try{
        const chatRef = doc(database, 'chats', chatID)
        await getDoc(chatRef).then(async (res)=>{ 
            const messages = [...res.data().messages]
            for(let i=0; i<messages.length; i++){
                if(messages[i].messageID===messageID){
                    messages.splice(i, 1)
                    await updateDoc(chatRef, {messages})
                    break
                }
            }
        }).then(()=>{
            res.send({successful: true})
        }).catch(()=>{
            res.send({successful: false, message: 'Unable to delete message'})
        })
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to delete message'})
    }
}

module.exports = deleteMessage