const sendPushNotification_2 = require("../pushNotification/sendPushNotification_2")



async function denyClipShare(req, res){
    const {cinema, cinemaFeeds, notifications, Followers} = req.dbModels
    
    const userID = req.body.userID // user.id
    let data = req.body.data

    async function confirmRequest(){
        // update my notification
        await directlyShareClip({Notifier: notify})

        async function notify(){
            const userNotification = await notifications.findOne({userID}).lean()
            if(userNotification){
                for(let i=0; i<userNotification.all.length; i++){
                    if(userNotification.all[i].id === data.id && userNotification.all[i].type==='clipShareRequest'){
                        userNotification.all[i].status = 'denied'
                        await notifications.updateOne({userID}, {all: [...userNotification.all]})
                        break
                    }
                }
            }
    
            // notify audience
            const newData = {...data}
            newData.message = 'Your request to share this bubble was granted, it has been automatically pushed to your followers'
            newData.status = 'granted'
            newData.when = new Date().toISOString()
            // newData.time = getDate()

            const dataUserNotification = await notifications.findOne({userID: data.userID})
            if(dataUserNotification === null){
                const newNotif = new notifications({userID: data.userID, all: [newData]})
                await newNotif.save()
            } else {
                dataUserNotification.all.push(newData)
                await notifications.updateOne({userID: data.userID}, {all: dataUserNotification.all})
                // await dataUserNotification.save()
            }

            const thisData = {
                title: `Share request granted`,
                body: `${newData.message}`,
                // body: 'please check the notification section in the app to see the bubble.',
                data: {
                    feed: data.feed,
                    type: "clipShare",
                    // url: "/main/bubbles/subReply",
                    // replyPath: [...newPath],
                }
                // icon: false
            }
            // await sendPushNotification(data.userID, thisData, req)
            await sendPushNotification_2({
                userIDs: [data.userID],
                data: thisData,
                req
            })
        }
    }
    
    async function notifyUser(){
        const userNotification = await notifications.findOne({userID}).lean()
        if(userNotification){
            for(let i=0; i<userNotification.all.length; i++){
                if(userNotification.all[i].id === data.id && userNotification.all[i].type==='shareRequest'){
                    userNotification.all[i].status = 'denied'
                    await notifications.updateOne({userID}, {all: [...userNotification.all]})
                    return
                }
            }
        }
    }


    
    // notify audience
    async function notifyAudience(){
        const newData = {...data}
        newData.message = 'Your request to share this clip was denied'
        newData.status = 'denied'
        newData.when = new Date().toISOString()
        // newData.time = getDate()
        const audienceNotification = await notifications.findOne({userID: data.userID}).lean()
        if(audienceNotification === null){
            const newNotif = new notifications({userID: data.userID, all: [newData]})
            await newNotif.save()
        } else {
            audienceNotification.all.push(newData)
            await notifications.updateOne({userID: data.userID}, {all: audienceNotification.all})
        }
        const thisData = {
            title: `Concealed`,
            body: `${newData.message}`,
            // body: 'please check the notification section in the concealed app to see the bubble, you can also make another share request to the bubble creator.',
            data: {
                feed: data.feed,
                type: "clipShare",
            }
        }
        // await sendPushNotification(data.userID, thisData, req)

        await sendPushNotification_2({
            req,
            data: thisData,
            userIDs: [data.userID]
        })
    }

    async function decreaseCount(){
        const thisClip = await cinema.findOne({postID: data.clipID}).lean()
        if(thisClip){
            if(thisClip?.sharePermission){
                thisClip.sharePermission = thisClip.sharePermission - 1
                await cinema.updateOne({postID: data.clipID}, {sharePermission: thisClip.sharePermission})
            }

        }
    }
    
    try {
        await notifyUser()
        await notifyAudience()
        await decreaseCount()
        // await confirmRequest()
        res.send({successful: true})
    } catch(e) {
        console.log(e);
        console.log("something went wrong along the line");
        res.send({successful: false, message: "something went wrong along the line"})
    }
}

module.exports = denyClipShare
