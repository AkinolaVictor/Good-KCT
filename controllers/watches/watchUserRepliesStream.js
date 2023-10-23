const { setDoc, doc } = require("firebase/firestore");
const { database } = require("../../database/firebase");
const userReplies = require("../../models/userReplies");
const date = require('date-and-time');

function watchUserRepliesStream(){
    try{
        const userRepliesDoc = userReplies.watch([], {fullDocument: "updateLookup"})
        userRepliesDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const now = new Date()
                const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')

                const userRepliesRef = doc(database, 'userReplies', data.fullDocument.userID)
                const bubbles = {...data.fullDocument}

                bubbles.formattedDate = formattedDate
                bubbles._id && delete bubbles._id
                await setDoc(userRepliesRef, {...bubbles}).catch(()=>{})
            }
        })

    } catch(e){
    }
}

module.exports = watchUserRepliesStream