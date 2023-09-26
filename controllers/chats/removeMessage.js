const {doc, getDoc, updateDoc, getDocs, collection, setDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function removeMessage(req, res){
    let chatID = req.body.chatID // data.chatID
    let messageID = req.body.messageID // data.chatID
    let userID = req.body.userID // user.id
    let sender = req.body.sender // item.sender
    
    try{
        const chatRef = doc(database, 'chats', chatID)
        await getDoc(chatRef).then(async (snapshot)=>{ 
            const messages = [...snapshot.data().messages]
            for(let i=0; i<messages.length; i++){
                if(messages[i].messageID===messageID){
                    if(userID!==sender){
                        messages[i].hideFromRecipient = userID
                        await updateDoc(chatRef, {messages})
                        break
                    }
                }
            }
        }).then(()=>{
            res.send({successful: true})
        }).catch(()=>{
            res.send({successful: false, message: 'Unable to remove message'})
        })
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to remove message'})
    }
}

module.exports = removeMessage