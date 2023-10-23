// watchSavedAudienceStream
const { setDoc, doc } = require("firebase/firestore");
const { database } = require("../../database/firebase");
const date = require('date-and-time');
const savedAudience = require("../../models/savedAudience");

function watchSavedAudienceStream(){
    try{
        const savedAudienceDoc = savedAudience.watch([], {fullDocument: "updateLookup"})
        savedAudienceDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const now = new Date()
                const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')

                const savedAudienceRef = doc(database, 'savedAudience', data.fullDocument.userID)
                const audience = {...data.fullDocument}
                audience.formattedDate = formattedDate
                
                audience._id && delete audience._id
                await setDoc(savedAudienceRef, {...audience}).catch(()=>{})
            }
        })
    } catch(e){
    }
}

module.exports = watchSavedAudienceStream