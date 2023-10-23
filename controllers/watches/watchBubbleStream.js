const { doc, setDoc } = require("firebase/firestore");
const bubble = require("../../models/bubble");
const { database } = require("../../database/firebase");
const date = require('date-and-time')

function watchBubbleStream(){
    try{
        const bubbleDoc = bubble.watch([], {fullDocument: "updateLookup"})
        // const notificationDoc = notifications.watch([], {fullDocument: "updateLookup"})
        bubbleDoc.on("change", async(data)=>{
            const now = new Date()
            const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')
            if(data.fullDocument){
                const fire_ref = doc(database, "bubbles", data.fullDocument.postID)
                const thisBubble = {...data.fullDocument, formattedDate}
                delete thisBubble._id
                thisBubble.bubbleNotFound = false
                await setDoc(fire_ref, {...thisBubble}).then(()=>{
                    // console.log("Done=>", data.fullDocument.postID);
                })
            }
        })

    } catch(e){
        // console.log("some error")
    }
}

module.exports = watchBubbleStream