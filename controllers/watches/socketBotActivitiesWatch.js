function socketBotActivitiesWatch(models, socket, io){
    const {botActivities} = models
    try{
        const botActivitiesDoc = botActivities.watch([], {fullDocument: "updateLookup"})
        botActivitiesDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const botActivity = {...data.fullDocument}
                const userID = botActivities.userID
                const otherBotActivities = botActivities.otherBotActivities
                const userBotActivities = botActivities.userBotActivities

                io.emit(`botActivities-${userID}`, {
                    type: "likes",
                    data: {otherBotActivities, userBotActivities}
                })
            }
        })
    } catch(e){
        console.log("some error from bot activities");
        console.log("bot activities", e);
    }
}

module.exports = socketBotActivitiesWatch