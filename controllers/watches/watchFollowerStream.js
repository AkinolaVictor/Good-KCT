const { setDoc, doc } = require("firebase/firestore");
const { database } = require("../../database/firebase");
const date = require('date-and-time');
const Followers = require("../../models/Followers");

function watchFollowerStream(){
    try{
        const followersDoc = Followers.watch([], {fullDocument: "updateLookup"})
        followersDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const now = new Date()
                const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')

                const followersRef = doc(database, 'followers', data.fullDocument.userID)
                const followers = {...data.fullDocument}
                followers.formattedDate = formattedDate

                delete followers._id
                await setDoc(followersRef, {...followers}).catch(()=>{})
            }
        })
    } catch(e){
    }
}

module.exports = watchFollowerStream