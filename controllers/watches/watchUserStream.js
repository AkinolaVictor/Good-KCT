const { setDoc, doc } = require("firebase/firestore");
const { database } = require("../../database/firebase");
const date = require('date-and-time');
const User = require("../../models/User");

function watchUserStream(){
    try{
        const userDoc = User.watch([], {fullDocument: "updateLookup"})
        userDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const userRef = doc(database, 'users', data.fullDocument.id)
                const user = {...data.fullDocument}
                const now = new Date()
                const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')
                user.formattedDate = formattedDate
                delete user._id
                await setDoc(userRef, {...user}).catch(()=>{})
            }
        })
    } catch(e){
    }
}

module.exports = watchUserStream