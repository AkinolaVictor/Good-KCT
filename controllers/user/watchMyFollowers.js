const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const sendPushNotification = require('../pushNotification/sendPushNotification')
const sendPushNotification_2 = require('../pushNotification/sendPushNotification_2')

async function watchMyFollowers(req, res){
    const {notifications, Followers, Following, eachUserAnalytics, savedAudience} = req.dbModels

    const userID = req.body.userID // user.id
    const userName = req.body.userName // user.id
    const data = req.body.data // props.data.userInfo.fullname
    const { awhile, tobefollowed} = data||{}

    // function ifCon(){
    //     if(data){
    //         const {con} = data
    //         if(con === "none"){
    //             return false
    //         } else {
    //             return true
    //         }
    //     } else {
    //         return false
    //     }
    // }

    async function FollowNotifier({newUserID, name}){
        if(userID !== newUserID){
            // data

            function constructMessage(){
                return `${name} automatically unfollowed you`
            }

            const followData = {
                when: new Date().toISOString(),
                userID: newUserID,
                message: constructMessage(),
                identityStatus: false,
                type: 'follow',
                id: uuidv4()
            }
    
            // check if
            const userNotification = await notifications.findOne({userID})
            if(userNotification === null){
                const newNotifications = new notifications({userID, all: [followData]})
                await newNotifications.save()
            } else {
                userNotification.all.push(followData)
                await notifications.updateOne({userID}, {all: [...userNotification.all]}).then(async()=>{
                    const thisData = {
                        title: `Concealed`,
                        body: `${name} automatically unfollowed you`,
                        data: {
                            type: "notification",
                            userID
                        }
                    }

                    await sendPushNotification(userID, thisData , req)

                    await sendPushNotification_2({
                        req, data: thisData,
                        userIDs: [userID]
                    })
                })
            }
        }
    }

    async function updateUserAnalytics(userID, thisUserID){
        const userAnalytics = await eachUserAnalytics.findOne({userID: thisUserID}).lean()
        if(userAnalytics === null){
            const data = {
                userID: thisUserID, 
                bubbles: {
                    [userID]: {
                        impressions: 0, replys: 0, likes: 0, shares: 0,
                        bubbleIDs: []
                    }
                }, 
                profile: {
                    [userID]: { follow: 1, views: 0 }
                },
                date: {}
                // date: {...getDate()}
            }
            const newUserAnalytics = new eachUserAnalytics({...data})
            await newUserAnalytics.save()
        } else {
            const {profile} = userAnalytics
            if(!profile[userID]){
                profile[userID] = {
                    follow: 1,
                    views: 0,
                }
            } else {
                profile[userID].follow++
            }
            await eachUserAnalytics.updateOne({userID: thisUserID}, {profile})
        }
    }

    
    try{
        const userFollowers = await Followers.findOne({userID}).lean()
        const userSavedAudience = await savedAudience.findOne({userID}).lean()

        let myFollowing = null
        if(tobefollowed.length) myFollowing = await Following.findOne({userID}).lean()

        if(userFollowers === null) return
        
        async function removeFromMyFollowers(id){
            if(userFollowers){
                const thisPerson = userFollowers.followers[id]
                if(thisPerson){
                    delete userFollowers.followers[id]
                    // send notification
                    await FollowNotifier({newUserID: id, name: thisPerson.name})
                }

                // remove from audience
                if(userSavedAudience){
                    const audience = {...userSavedAudience.audience}
                    const auds = [...Object.keys(audience)]
                    for(let i=0; i<auds.length; i++){
                        const current = auds[i]
                        const subAud = audience[current].audience
                        if(subAud.length){
                            for(let j=0; j<subAud.length; j++){
                                if(subAud[j].id===id){
                                    userSavedAudience.audience[auds[i]].audience.splice(j, 1)
                                }
                            }
                        }
                    }
                }

            }
        }
        
        async function removeFromUserFollowing({id}){
            const userFollowing = await Following.findOne({userID: id}).lean()
            if(userFollowing){
                if(userFollowing.following[userID]){
                    delete userFollowing.following[userID]
                    await Following.updateOne({userID: id}, {following: userFollowing.following})
                }
            }
        }
        
        for(let i=0; i<awhile.length; i++){
            const {id} = awhile[i]
            await removeFromMyFollowers(id)
            await removeFromUserFollowing({id})
        }
        
        if(myFollowing){
            const followers = myFollowing.following
            for(let i=0; i<tobefollowed; i++){
                const {id} = tobefollowed[i]
                if(!followers[id]){
                    await removeFromMyFollowers(id)
                    await removeFromUserFollowing({id})
                }
            }
        }

        await Followers.updateOne({userID}, {following: userFollowers.followers})
        // update audience
        await savedAudience.updateOne({userID}, {
            audience: userSavedAudience.audience
        })

        res.send({successful: true})
    } catch(e){
        console.log(e);
        res.send({successful: false})
    }

    // Follow()
}

module.exports = watchMyFollowers