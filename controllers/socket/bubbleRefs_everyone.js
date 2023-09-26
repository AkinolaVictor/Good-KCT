// bubblesForEveryone
const { doc, onSnapshot } = require("firebase/firestore");
const { database } = require("../../database/firebase");


let subscribed = false
function bubbleRefs_everyone(socket, io){
    socket.on("bubbleRefs_everyone", (data)=>{
        // console.log(subscribed);
        // if(!global.bubblesForEveryone){
        if(!subscribed){
            subscribeToBubblesForEveryone()
            // console.log('calles');
        }

        async function subscribeToBubblesForEveryone(){
            const bubblesForEveryoneRef = doc(database, 'bubblesForEveryone', 'Everyone')
            onSnapshot(bubblesForEveryoneRef, (docsnap)=>{
                if(docsnap.exists()){
                    const bubbleRefs = [...docsnap.data().bubbleRefs]
                    io.emit(`bubblesForEveryone`, {bubbleRefs})
                    subscribed=true
                }
            })
            
        }
    })
}

module.exports = bubbleRefs_everyone