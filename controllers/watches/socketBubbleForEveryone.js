// const date = require('date-and-time');

function socketBubbleForEveryone(models, socket, io){
    const {bubblesForEveryone} = models
    try{
        const bubblesDoc = bubblesForEveryone.watch([], {fullDocument: "updateLookup"})
        bubblesDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const allDoc = {...data.fullDocument}
                io.emit(`bubbles_for_everyone`, {
                    type: "bubbles_for_everyone",
                    data: {bubbleRefs: [...allDoc.bubbleRefs]}
                })
            }
        })

    } catch(e){
        console.log("some error from bubbleForEveryone");
        console.log("bubbleForEveryone", e);
    }
}

module.exports = socketBubbleForEveryone