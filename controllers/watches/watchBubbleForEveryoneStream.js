const { setDoc, doc } = require("firebase/firestore");
const { database } = require("../../database/firebase");
// const bubblesForEveryone = require("../../models/bubblesForEveryone");

function watchBubblesForEveryoneStream(models){
    const {bubblesForEveryone} = models
    try{
        const bubblesDoc = bubblesForEveryone.watch([], {fullDocument: "updateLookup"})
        bubblesDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const bubblesRef = doc(database, 'bubblesForEveryone', "Everyone")
                const allDoc = {...data.fullDocument}
                delete allDoc._id
                await setDoc(bubblesRef, {...allDoc}).catch(()=>{})
            }
        })

    } catch(e){
    }
}

module.exports = watchBubblesForEveryoneStream