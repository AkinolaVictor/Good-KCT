const { setDoc, doc } = require("firebase/firestore");
const { database } = require("../../database/firebase");
const userFeeds = require("../../models/Feeds");
const date = require('date-and-time');

function watchUserFeedsStream(){
    try{
        const userFeedsDoc = userFeeds.watch([], {fullDocument: "updateLookup"})
        userFeedsDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const now = new Date()
                const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')

                const userFeedsRef = doc(database, 'feeds', data.fullDocument.userID)
                const bubbles = {...data.fullDocument}

                bubbles.formattedDate = formattedDate
                bubbles._id && delete bubbles._id
                await setDoc(userFeedsRef, {...bubbles}).catch(()=>{})
            }
        })

    } catch(e){
    }
}

module.exports = watchUserFeedsStream