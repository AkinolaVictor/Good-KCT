const { setDoc, doc } = require("firebase/firestore");
const notifications = require("../../models/notifications");
const { database } = require("../../database/firebase");
// const date = require('date-and-time')

function watchNotificationStream(){
    try{
        const notificationDoc = notifications.watch([], {fullDocument: "updateLookup"})
        notificationDoc.on("change", async(data)=>{
            if(data.fullDocument){
                // const now = new Date()
                // const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')
                const notificationRef = doc(database, 'notifications', data.fullDocument.userID)
                await setDoc(notificationRef, {all: data.fullDocument.all}).catch(()=>{})
            }
        })

    } catch(e){
        // console.log("some error")
    }
}

module.exports = watchNotificationStream