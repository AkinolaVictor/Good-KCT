const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const sendPushNotification = require('../pushNotification/sendPushNotification')
const sendPushNotification_2 = require('../pushNotification/sendPushNotification_2')
// const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
// const {database} = require('../../database/firebase')
// const Following = require('../../models/Following')
// const Followers = require('../../models/Followers')
// const notifications = require('../../models/notifications')

async function interFollow(req, res){
    const {notifications, Followers, Following, eachUserAnalytics} = req.dbModels

    const userID = req.body.userID // user.id
    const userName = req.body.userName // user.userInfo.fullname
    const newUserID = req.body.newUserID // props.data.id
    const newUserName = req.body.newUserName // props.data.userInfo.fullname
    const data = req.body.data// props.data.userInfo.fullname
    // const {con} = data||{}
    // console.log(data);
    // res.send({successful: true})
    // return

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

    async function FollowNotifier(which, reverse){
        if(userID !== newUserID){
            // data
            // function getDate(){
            //     const now = new Date()
            //     const time = date.format(now, 'h:mmA')
            //     const when = date.format(now, 'DD/MM/YYYY')
            //     const dateString = date.format(now, 'YYYY,MM,DD,HH,mm,ss')
                
            //     return {
            //         time,
            //         date: when,
            //         dateString
            //     }
            // }

            // function constructMessage(){
            //     if(which==='follow'){
            //         return `${userName} is now following you`
            //     } else {
            //         return `${userName} unfollowed you`
            //     }
            // }

            // function newMessage(){
            //     if(data){
            //         const {con} = data
            //         if(con === "none"){
            //             return `${userName} is now following you`
            //         } else if(con === "follow on promise"){
            //             return `${userName} promised to follow you, but based on your choice.`
            //         } else {
            //             return `${userName} follows you conditionally`
            //         }
            //     } else {
            //         return `${userName} is now following you`
            //     }
            // }

            const followData = {
                when: new Date().toISOString(),
                userID: reverse?newUserID:userID,
                message: `${reverse?newUserName:userName} is now following you`,
                identityStatus: false,
                condition: data,
                type: 'follow',
                id: uuidv4(),
            }
    
            // check if
            const userNotification = await notifications.findOne({userID: reverse?userID:newUserID})
            if(userNotification===null){
                const newNotifications = new notifications({userID: reverse?userID:newUserID, all: [followData]})
                await newNotifications.save()
            } else {
                userNotification.all.push(followData)
                await notifications.updateOne({userID: reverse?userID:newUserID}, {all: [...userNotification.all]}).then(async()=>{
                    // const user = 
                    const thisData = {
                        title: `Concealed`,
                        body: `${reverse?newUserName:userName} is now following you`,
                        // icon: false
                    }
                    const thisID = reverse?userID:newUserID
                    await sendPushNotification(thisID, thisData , req)
                    
                    await sendPushNotification_2({
                        req, data: thisData,
                        userIDs: [thisID]
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

    const Follow = async () => {
        try {
            // add user to my following
            const userFollowing = await Following.findOne({userID}).lean()
            if(userFollowing===null){
                const following = new Following({userID, following: { [newUserID]: {name: newUserName, id: newUserID, data}}})
                await following.save()
            } else {
                if(!userFollowing.following){userFollowing.following = {}}
                if(!userFollowing.following[newUserID]){
                    userFollowing.following[newUserID] = {name: newUserName, id: newUserID, data}
                    await Following.updateOne({userID}, {following: userFollowing.following})
                }
            }
    
            // add me to user following
            const userFollowing2 = await Following.findOne({userID: newUserID}).lean()
            if(userFollowing2===null){
                const following = new Following({userID: newUserID, following: { [userID]: {name: userName, id: userID, data}}})
                await following.save()
            } else {
                if(!userFollowing2.following){userFollowing2.following = {}}
                if(!userFollowing2.following[userID]){
                    userFollowing2.following[userID] = {name: userName, id: userID, data}
                    await Following.updateOne({userID: newUserID}, {following: userFollowing2.following})
                }
            }
    
    
    
            // add my id to user followers
            const userFollowers = await Followers.findOne({userID: newUserID}).lean()
            if(userFollowers===null){
                const followers = new Followers({userID: newUserID, followers: {
                    [userID]: {name: userName, id: userID, data}
                }})
                await followers.save()
                await FollowNotifier("follow")
                await updateUserAnalytics(userID, newUserID)
            } else {
                if(!userFollowers.followers){userFollowers.followers = {}}
                if(!userFollowers.followers[userID]){
                    userFollowers.followers[userID] = {name: userName, id: userID, data}
                    await Followers.updateOne({userID: newUserID}, {followers: userFollowers.followers})
                    await FollowNotifier("follow")
                    await updateUserAnalytics(userID, newUserID)
                }
            }
    
    
            // add user id to my followers
            const userFollowers2 = await Followers.findOne({userID}).lean()
            if(userFollowers2===null){
                const followers = new Followers({userID, followers: {
                    [newUserID]: {name: newUserName, id: newUserID, data}
                }})
                await followers.save()
                await FollowNotifier("follow", true)
                await updateUserAnalytics( newUserID, userID )
            } else {
                if(!userFollowers2.followers){userFollowers2.followers = {}}
                if(!userFollowers2.followers[newUserID]){
                    userFollowers2.followers[newUserID] = {name: newUserName, id: newUserID, data}
                    await Followers.updateOne({userID}, {followers: userFollowers2.followers})
                    await FollowNotifier("follow", true)
                    await updateUserAnalytics( newUserID, userID )
                }
            }
    
            res.send({successful: true})
        } catch (e){
            console.log(e);
            console.log("from inter follow");
            res.send({successful: false})
        }
    }

    Follow()
}

module.exports = interFollow