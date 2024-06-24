function socketNotificationWatch(models, socket, io){
    const {notifications} = models
    try{
        const notificationDoc = notifications.watch([], {fullDocument: "updateLookup"})
        notificationDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const userID = data.fullDocument.userID
                io.emit(`notification-${userID}`, {
                    type: "notification",
                    data: data.fullDocument.all
                })
            }
        })

    } catch(e){
        console.log("some error from notification");
        console.log("notification", e);
    }
}

module.exports = socketNotificationWatch