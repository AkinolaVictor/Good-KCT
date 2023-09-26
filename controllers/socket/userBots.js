// bubblesForEveryone
const { doc, onSnapshot } = require("firebase/firestore");
const { database } = require("../../database/firebase");


let subscriptions = {}
function userBots(socket, io){
    socket.on("userBots", (data)=>{
        const botIDs = [...data]
        // console.log(subscriptions);
        if(botIDs.length){
            for(let i=0; i<botIDs.length; i++){
                const currentID = botIDs[i]
                if(!subscriptions[currentID]){
                    subscribeToBot(currentID)
                }
            }
        }

        async function subscribeToBot(botID){
            const botRef = doc(database, 'bots', botID)
            onSnapshot(botRef, (botDoc)=>{
                if(botDoc.exists()){
                    const bot = {...botDoc.data()}
                    subscriptions[botID] = true
                    io.emit(`userBots-${botID}`, bot)
                }
            })
        }
    })
}

module.exports = userBots