// bubblesForEveryone
const { doc, onSnapshot } = require("firebase/firestore");
const { database } = require("../../database/firebase");


let subscriptions = {}
function userChats(socket, io){
    socket.on("userChats", (data)=>{
        const chatIDs = [...data]
        // console.log(chatIDs);
        if(chatIDs.length){
            for(let i=0; i<chatIDs.length; i++){
                const currentID = chatIDs[i]
                if(!subscriptions[currentID]){
                    subscribeToChat(currentID)
                }
            }
        }

        async function subscribeToChat(chatID){
            const userChatRef = doc(database, 'chats', chatID)
            onSnapshot(userChatRef, (chats)=>{
                if(chats.exists()){
                    const data = {...chats.data()}
                    subscriptions[chatID] = true
                    io.emit(`userChats-${chatID}`, data)
                }
            })
        }
    })
}

module.exports = userChats