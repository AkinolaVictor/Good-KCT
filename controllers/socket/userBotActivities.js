// userBotActivities
const { doc, onSnapshot } = require("firebase/firestore");
const { database } = require("../../database/firebase");


const subscriptions = {}

function userBotActivities(socket, io){
    socket.on("userBotActivities", (data)=>{
        const userID = data.userID

        if(!subscriptions[userID]){
            if(userID){
                subscribeToBotActivities()
            }
        }


        async function subscribeToBotActivities(){
            const botActivityRef = doc(database, 'botActivities', userID)
            onSnapshot(botActivityRef, (docsnap)=>{
                if(docsnap.exists()){
                    const botActivities = {...docsnap.data()}
                    subscriptions[userID] = true
                    io.emit(`userBotActivities-${userID}`, {botActivities})
                }
            })
        }
    })
}

module.exports = userBotActivities