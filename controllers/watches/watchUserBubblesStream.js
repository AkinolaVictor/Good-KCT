const { setDoc, doc } = require("firebase/firestore");
const { database } = require("../../database/firebase");
const userReplies = require("../../models/userReplies");
const date = require('date-and-time');
const userBubbles = require("../../models/userBubbles");

function watchUserBubblesStream(){
    try{
        const userRepliesDoc = userBubbles.watch([], {fullDocument: "updateLookup"})
        userRepliesDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const now = new Date()
                const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')

                const userRepliesRef = doc(database, 'userBubbles', data.fullDocument.userID)
                const bubbles = {...data.fullDocument}

                bubbles.formattedDate = formattedDate
                bubbles._id && delete bubbles._id
                console.log(bubbles);
                await setDoc(userRepliesRef, {...bubbles}).catch(()=>{})
            }
        })

    } catch(e){
    }
}

module.exports = watchUserBubblesStream