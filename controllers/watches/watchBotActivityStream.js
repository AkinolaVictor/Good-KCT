// botActivities
const { setDoc, doc } = require("firebase/firestore");
const { database } = require("../../database/firebase");
const date = require('date-and-time');
// const botActivities = require("../../models/botActivities");

function watchBotActivityStream(models){
    const {botActivities} = models
    try{
        const botActivitiesDoc = botActivities.watch([], {fullDocument: "updateLookup"})
        botActivitiesDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const now = new Date()
                const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')

                const botActivitiesRef = doc(database, 'botActivities', data.fullDocument.userID)
                const botActivity = {...data.fullDocument}
                botActivity.formattedDate = formattedDate
                
                delete botActivity._id
                await setDoc(botActivitiesRef, {...botActivity}).catch(()=>{})
            }
        })
    } catch(e){
    }
}

module.exports = watchBotActivityStream