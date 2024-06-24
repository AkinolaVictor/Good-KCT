
function socketBotWatch(models, socket, io){
    const {bot} = models
    try{
        const botDoc = bot.watch([], {fullDocument: "updateLookup"})
        botDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const bot = data.fullDocument
                const botID = bot.id
                io.emit(`userBots-${botID}`, {
                    type: "bot",
                    data: {...bot}
                })
            }
        })

    } catch(e){
        console.log("some error from bot");
        console.log("bot", e);
    }
}

module.exports = socketBotWatch