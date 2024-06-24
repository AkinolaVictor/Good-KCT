function socketChatWatch(models, socket, io){
    const {chats} = models
    try{
        const chatsDoc = chats.watch([], {fullDocument: "updateLookup"})
        chatsDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const chatData = {...data.fullDocument}
                const chatID = chatData.chatID
                io.emit(`chat-${chatID}`, {
                    type: "chat",
                    data: chatData.messages
                })
            }
        })

    } catch(e){
        console.log("some error from chat");
        console.log("chat", e);
    }
}

module.exports = socketChatWatch