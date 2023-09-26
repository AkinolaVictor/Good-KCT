const {doc, getDoc, updateDoc, getDocs, collection, setDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function seenMessage(req, res){
    let chatID = req.body.chatID // data.chatID
    let userID = req.body.userID // data.chatID
    
    try{
        const chatRef = doc(database, 'chats', chatID)
        await getDoc(chatRef).then(async (snapshot)=>{ 
            const messages = [...snapshot.data().messages]
            let updatedSeen = false
            for(let i=0; i<messages.length; i++){
                if(messages[i].sender!==userID){
                    if(messages[i].seen===false){
                        messages[i].seen=true
                        updatedSeen = true
                    }
                }
            }
            if(updatedSeen){
                await updateDoc(chatRef, {messages})
            }
        }).then(()=>{
            res.send({successful: true})
        }).catch(()=>{
            res.send({successful: false, message: 'Unable to send chat'})
        })
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to send chat'})
    }
}

module.exports = seenMessage