const { setDoc, doc } = require("firebase/firestore");
const { database } = require("../../database/firebase");
const date = require('date-and-time');
// const bot = require("../../models/bot");

function watchBotStream(models){
    const {bot} = models
    try{
        const botDoc = bot.watch([], {fullDocument: "updateLookup"})
        botDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const now = new Date()
                const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')
                const bot = data.fullDocument
                delete bot._id
                const botRef = doc(database, 'bots', bot.id)
                await setDoc(botRef, {...bot, formattedDate, botNotFound: false}).catch(()=>{})
            }
        })

    } catch(e){
    }
}

module.exports = watchBotStream