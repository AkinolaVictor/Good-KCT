const { doc, onSnapshot } = require("firebase/firestore");
const { database } = require("../../database/firebase");


const subscriptions = {}

function userNotification(socket, io){
    socket.on("userNotification", (data)=>{
        const userID = data.userID

        if(!subscriptions[userID]){
            if(userID){
                subscribeToNotification()
            }
        }


        async function subscribeToNotification(){
            const notificationRef = doc(database, 'notifications', userID)
            onSnapshot(notificationRef, (docsnap)=>{
                if(docsnap.exists()){
                    const notifications = [...docsnap.data().all]
                    for(let j=0; j<notifications.length; j++){
                        notifications[j].hide = false
                    }
                    subscriptions[userID] = true
                    io.emit(`userNotification-${userID}`, {notifications})
                }
            })
        }
    })
}

module.exports = userNotification