// bubble
const { doc, onSnapshot } = require("firebase/firestore");
const { database } = require("../../database/firebase");


const subscriptions = {}

function bubble(socket, io){
    socket.on("bubble", (data)=>{
        const bubbleID = data.bubbleID

        if(!subscriptions[bubbleID]){
            subscribeToBubble()
        }


        async function subscribeToBubble(){
            const bubbleRef = doc(database, 'bubbles', bubbleID)
            onSnapshot(bubbleRef, (snapshot)=>{
                if(snapshot.exists()){
                    const bubble = {...snapshot.data()}
                    // FORMAT DATA 
                    if(typeof(bubble.reply) === "string"){
                        const reply = JSON.parse(bubble.reply)
                        bubble.reply = reply
                    }
                    
                    // INSERT FORMATTED DATA
                    if(typeof(bubble.shareStructure) === "string"){
                        const shareStructure = JSON.parse(bubble.shareStructure)
                        bubble.shareStructure = shareStructure
                    }

                    if(bubble.followers){
                        delete bubble.followers
                    }

                    subscriptions[bubbleID] = true
                    io.emit(`bubble-${bubbleID}`, {...bubble})
                } else {
                    
                    io.emit(`bubble-${bubbleID}`, false)
                }
            })
        }
    })
}

module.exports = bubble