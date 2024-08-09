const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const sendPushNotification = require('../pushNotification/sendPushNotification')
// const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
// const {database} = require('../../database/firebase')
// const Following = require('../../models/Following')
// const Followers = require('../../models/Followers')
// const notifications = require('../../models/notifications')

async function follow(req, res){
    const {notifications, Followers, Following, eachUserAnalytics} = req.dbModels

    const userID = req.body.userID // user.id
    const userName = req.body.userName // user.userInfo.fullname
    const newUserID = req.body.newUserID // props.data.id
    const newUserName = req.body.newUserName // props.data.userInfo.fullname
    const dontNotify = req.body.dontNotify
    // const data = req.body.data||{con: "none", condate: new Date().toISOString()} // props.data.userInfo.fullname
    const data = req.body.data// props.data.userInfo.fullname
    const followPath = req.body.followPath// props.data.userInfo.fullname
    const {con} = data||{}
    // console.log(data);
    // res.send({successful: true})
    // return

    function ifCon(){
        if(data){
            const {con} = data
            if(con === "none"){
                return false
            } else {
                return true
            }
        } else {
            return false
        }
    }

    async function FollowNotifier(which){
        if(userID !== newUserID){

            function additionalMessage(){
                if(followPath){
                    const {type, path, bubbleRef} = followPath||{}
                    const {userID} = bubbleRef||{}
                    if(type === "bubble"){
                        return `, after seeing ${newUserID===userID?"your":"this"} bubble.`
                    } else if (type==="reply"){
                        return `, after seeing your reply.`
                    } else {
                        return "."
                    }
                }
                return "."
            }

            function newMessage(){
                if(data){
                    const {con} = data
                    if(con === "none"){
                        return `${userName} is now following you${additionalMessage()}`
                    } else if(con === "follow on promise"){
                        // return `${userName} will follow you if you decide`
                        return `${userName} promised to follow you, but based on your choice${additionalMessage()}`
                    } else {
                        return `${userName} follows you conditionally${additionalMessage()}`
                    }
                } else {
                    return `${userName} is now following you${additionalMessage()}`
                }
            }

            const followData = {
                // time: getDate(),
                when: new Date().toISOString(),
                userID,
                message: newMessage(),
                identityStatus: false,
                condition: data,
                type: ifCon()?"con_follow":'follow',
                id: uuidv4(),
            }

            if(followPath){
                followData.followPath = followPath.type

                if(followPath.bubbleRef) followData.feed = followPath.bubbleRef
                if(followPath.path) followData.replyPath = followPath.path
            }
    
            // check if
            const userNotification = await notifications.findOne({userID: newUserID})
            if(userNotification===null){
                const newNotifications = new notifications({userID: newUserID, all: [followData]})
                await newNotifications.save()
            } else {
                userNotification.all.push(followData)
                await notifications.updateOne({userID: newUserID}, {all: [...userNotification.all]}).then(async()=>{
                    // const user = 
                    const thisData = {
                        title: `Concealed`,
                        // body: `${userName} is now following you`,
                        body: newMessage(),
                        icon: false
                    }
                    await sendPushNotification(newUserID, thisData , req)
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
        // add user id to my following
        if(con === "follow on promise"){
            await FollowNotifier("follow")
            res.send({successful: true})
            return
        }

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

        // add my id to user followers
        const userFollowers = await Followers.findOne({userID: newUserID}).lean()
        if(userFollowers===null){
            const followers = new Followers({userID: newUserID, followers: {
                [userID]: {name: userName, id: userID, data}
            }})
            await followers.save()
            if(!dontNotify){
                await FollowNotifier("follow")
            }
            await updateUserAnalytics(userID, newUserID)
        } else {
            if(!userFollowers.followers){userFollowers.followers = {}}
            if(!userFollowers.followers[userID]){
                userFollowers.followers[userID] = {name: userName, id: userID, data}
                await Followers.updateOne({userID: newUserID}, {followers: userFollowers.followers})
                if(!dontNotify){
                    await FollowNotifier("follow")
                }
                await updateUserAnalytics(userID, newUserID)
            }
        }

        res.send({successful: true})
    }

    Follow()
}

module.exports = follow