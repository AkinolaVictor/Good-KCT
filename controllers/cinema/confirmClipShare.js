const sendPushNotification_2 = require("../pushNotification/sendPushNotification_2")



async function confirmClipShare(req, res){
    const {cinema, cinemaFeeds, notifications, Followers, userShares, User} = req.dbModels
    
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
                        userNotification.all[i].status = 'granted'
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

    async function updateUserShares(){
        const userReps = await userShares.findOne({userID: data.userID}).lean()
        if(userReps){
            const cinema = userReps?.cinema?[...userReps?.cinema]:[]
            for(let i=0; i<cinema.length; i++){
                const each = cinema[i]
                if(each.postID === data.clipID) return
            }
            cinema.push(feedRef)
            await userShares.updateOne({userID: data.userID}, {cinema})
        }
    }

    async function directlyShareClip({Notifier}){
        try {
            let thisClip = await cinema.findOne({postID: data.clipID}).lean()
    
            if(thisClip){
                const feedRef = thisClip?.feedRef||{metaData: {}}
                const {loc, gend} = feedRef?.metaData||{}
                
                const shares = thisClip?.allShares||[]
                if(!shares.includes(data.userID)){
                    shares.push(data.userID)
                    await cinema.updateOne({postID: data.clipID}, {allShares: shares})
                    const userFollowers = await Followers.findOne({userID: data.userID}).lean()
                    const fflArr = Object.keys(userFollowers.followers)
    
                    for(let i=0; i<fflArr.length; i++){
                        const each = fflArr[i]
                        if(loc || gend){
                            const cacheUser = await User.findOne({id: each}).lean()
                            if(loc){
                                if(cacheUser){
                                    const {location} = cacheUser?.userInfo
                                    const loco = location?.country?.toLowerCase()
                                    if(!loc.includes(loco)) continue
                                }
                            }
                
                            if(gend){
                                // const cacheUser = await User.findOne({id: followers[i]}).lean()
                                if(cacheUser){
                                    const {gender} = cacheUser?.userInfo
                                    const thisGender = gender==="male"?"m":gender==="female"?"f":"a"
                                    if(gend!==thisGender) continue
                                }
                            }
                        }

                        const userCinFeed = await cinemaFeeds.findOne({userID: each})
                        if(userCinFeed){
                            userCinFeed.cinema.push(feedRef)
                            await cinemaFeeds.updateOne({userID: each}, {cinema: userCinFeed.cinema})
                        }
                    }

                    await updateUserShares()
                    await Notifier()
                }

                res.send({successful: true})
            } else {
                console.log("failed");
                res.send({successful: false, message: 'server error'})
            }
        } catch (e) {
            console.log(e);
            console.log("failed");
            res.send({successful: false, message: 'problem encountered'})
        }
    }

    try {
        await confirmRequest()
    } catch(e) {
        console.log(e);
        console.log("something went wrong along the line");
        res.send({successful: false, message: "something went wrong along the line"})
    }
}

module.exports = confirmClipShare
