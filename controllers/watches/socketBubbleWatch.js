function socketBubbleWatch(models, socket, io){
    const {bubble} = models
    try{
        const bubbleDoc = bubble.watch([], {fullDocument: "updateLookup"})
        bubbleDoc.on("change", async(data)=>{
            // console.log("bubble changed");
            if(data.fullDocument){
                
                const thisBubble = {...data.fullDocument}
                delete thisBubble._id
                const postID = thisBubble.postID
                
                if(typeof(thisBubble.reply) === "string"){
                    const reply = JSON.parse(thisBubble.reply)
                    thisBubble.reply = reply
                }
                
                // INSERT FORMATTED DATA
                if(typeof(thisBubble.shareStructure) === "string"){
                    const shareStructure = JSON.parse(thisBubble.shareStructure)
                    thisBubble.shareStructure = shareStructure
                }

                if(thisBubble.followers){
                    delete thisBubble.followers
                }

                io.emit(`bubble-${postID}`, {
                    type: "bubble",
                    data: thisBubble
                })
            }
        })

    } catch(e){
        console.log("some error from bubbles")
        console.log("bubbles", e)
    }
}

module.exports = socketBubbleWatch