const { setDoc, doc } = require("firebase/firestore");
const { database } = require("../../database/firebase");
const date = require('date-and-time');
// const Following = require("../../models/Following");

function watchFollowingtream(models){
    const {Following} = models
    try{
        const followingDoc = Following.watch([], {fullDocument: "updateLookup"})
        followingDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const now = new Date()
                const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')

                const followingRef = doc(database, 'following', data.fullDocument.userID)
                const following = {...data.fullDocument}
                following.formattedDate = formattedDate
                
                delete following._id
                await setDoc(followingRef, {...following}).catch(()=>{})
            }
        })
    } catch(e){
    }
}

module.exports = watchFollowingtream