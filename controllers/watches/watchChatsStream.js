const { setDoc, doc } = require("firebase/firestore");
const { database } = require("../../database/firebase");
const date = require('date-and-time');
const chats = require("../../models/chats");

function watchChatsStream(){
    try{
        const chatsDoc = chats.watch([], {fullDocument: "updateLookup"})
        chatsDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const now = new Date()
                const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')
                const chatsRef = doc(database, 'chats', data.fullDocument.chatID)
                const chatData = {...data.fullDocument}
                
                chatData.formattedDate = formattedDate
                chatData._id && delete chatData._id
                // console.log(chatData);
                await setDoc(chatsRef, {...chatData}).catch(()=>{})
            }
        })

    } catch(e){
    }
}

module.exports = watchChatsStream