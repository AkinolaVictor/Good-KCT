const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const sendPushNotification = require('../pushNotification/sendPushNotification')

async function watchMyFollowing(req, res){
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

    async function FollowNotifier({newUserID}){
        if(userID !== newUserID){
            // data

            function constructMessage(){
                return `${userName} automatically unfollowed you`
            }

            const followData = {
                when: new Date().toISOString(),
                userID,
                message: constructMessage(),
                identityStatus: false,
                type: 'follow',
                id: uuidv4()
            }
    
            // check if
            const userNotification = await notifications.findOne({userID: newUserID})
            if(userNotification === null){
                const newNotifications = new notifications({userID: newUserID, all: [followData]})
                await newNotifications.save()
            } else {
                userNotification.all.push(followData)
                await notifications.updateOne({userID: newUserID}, {all: [...userNotification.all]}).then(()=>{
                    const thisData = {
                        title: `Concealed`,
                        body: `${userName} has automatically unfollowed you`,
                        icon: false
                    }
                    sendPushNotification(newUserID, thisData , req)
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
        const userFollowing = await Following.findOne({userID}).lean()
        let myFollowers = null
        if(tobefollowed.length) myFollowers = await Followers.findOne({userID}).lean()

        if(userFollowing === null) return
        
        function removeFromMyFollowing(id){
            if(userFollowing){
                if(userFollowing.following[id]){
                    delete userFollowing.following[id]
                }
            }
        }
        
        async function removeFromUserFollowers({id}){
            const userFollowers = await Followers.findOne({userID: id}).lean()
            if(userFollowers){
                if(userFollowers.followers[userID]){
                    delete userFollowers.followers[userID]
                    await Followers.updateOne({userID: id}, {followers: userFollowers.followers})
                    
                    // remove from audience
                    const userSavedAudience = await savedAudience.findOne({userID: id}).lean()
                    if(userSavedAudience){
                        const audience = {...userSavedAudience.audience}
                        const auds = [...Object.keys(audience)]
                        for(let i=0; i<auds.length; i++){
                            const current = auds[i]
                            const subAud = audience[current].audience
                            if(subAud.length){
                                for(let j=0; j<subAud.length; j++){
                                    if(subAud[j].id===userID){
                                        userSavedAudience.audience[auds[i]].audience.splice(j, 1)
                                    }
                                }
                            }
                        }
                        
                        // update audience
                        await savedAudience.updateOne({userID: id}, {
                            audience: userSavedAudience.audience
                        })
                    }

                    // send notification
                    await FollowNotifier({newUserID: id})
                }
            }
        }
        
        for(let i=0; i<awhile.length; i++){
            const {id} = awhile[i]
            removeFromMyFollowing(id)
            await removeFromUserFollowers({id})
        }
        
        if(myFollowers){
            const followers = myFollowers.followers
            for(let i=0; i<tobefollowed; i++){
                const {id} = tobefollowed[i]
                if(!followers[id]){
                    removeFromMyFollowing(id)
                    await removeFromUserFollowers({id})
                }
            }
        }

        await Following.updateOne({userID}, {following: userFollowing.following})
        res.send({successful: true})
    } catch(e){
        console.log(e);
        res.send({successful: false})
    }

    // Follow()
}

module.exports = watchMyFollowing