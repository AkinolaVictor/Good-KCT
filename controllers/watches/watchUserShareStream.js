const { setDoc, doc } = require("firebase/firestore");
const { database } = require("../../database/firebase");
const userShares = require("../../models/userShares");
const date = require('date-and-time');

function watchUserShareStream(){
    try{
        const userSharesDoc = userShares.watch([], {fullDocument: "updateLookup"})
        userSharesDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const now = new Date()
                const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')

                const userSharesRef = doc(database, 'userShares', data.fullDocument.userID)
                const bubbles = {...data.fullDocument}

                bubbles.formattedDate = formattedDate
                bubbles._id && delete bubbles._id
                await setDoc(userSharesRef, {...bubbles}).catch(()=>{})
            }
        })

    } catch(e){
    }
}

module.exports = watchUserShareStream