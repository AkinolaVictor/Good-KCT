const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
const {database} = require('../../database/firebase')
const Following = require('../../models/Following')
const Followers = require('../../models/Followers')
const notifications = require('../../models/notifications')

async function follow(req, res){
    const userID = req.body.userID // user.id
    const userName = req.body.userName // user.userInfo.fullname
    const newUserID = req.body.newUserID // props.data.id
    const newUserName = req.body.newUserName // props.data.userInfo.fullname

    async function FollowNotifier(which){
        if(userID !== newUserID){
            // data
            function getDate(){
                const now = new Date()
                const time = date.format(now, 'h:mmA')
                const when = date.format(now, 'DD/MM/YYYY')
                const dateString = date.format(now, 'YYYY,MM,DD,HH,mm,ss')
                
                return {
                    time,
                    date: when,
                    dateString
                }
            }

            function constructMessage(){
                if(which==='follow'){
                    return `${userName} is now following you`
                } else {
                    return `${userName} unfollowed you`
                }
            }

            const followData = {
                time: getDate(),
                // bubbleID: thisBubble.postID,
                // creatorID: thisBubble.user.id,
                userID,
                message: constructMessage(),
                identityStatus: false,
                // feed: thisBubble.refDoc,
                type: 'follow'
            }
    
            // check if
            const userNotification = await notifications.findOne({userID: newUserID})
            if(userNotification===null){
                const newNotifications = new notifications({userID: newUserID, all: [followData]})
                await newNotifications.save()
            } else {
                userNotification.all.push(followData)
                // await userNotification.save()
                await notifications.updateOne({userID: newUserID}, {all: [...userNotification.all]})
                // await notifications.updateOne({userID: newUserID}, {all: userNotification.all})
            }
        }
    }

    const Follow = async () => {
        // add user id to my following
        const userFollowing = await Following.findOne({userID}).lean()
        if(userFollowing===null){
            const following = new Following({userID, following: { [newUserID]: {name: newUserName, id: newUserID}}})
            await following.save()
        } else {
            if(!userFollowing.following){userFollowing.following = {}}
            if(!userFollowing.following[newUserID]){
                userFollowing.following[newUserID] = {name: newUserName, id: newUserID}
                await Following.updateOne({userID}, {following: userFollowing.following})
            }
        }

        // add my id to user followers
        const userFollowers = await Followers.findOne({userID: newUserID}).lean()
        if(userFollowers===null){
            const followers = new Followers({userID: newUserID, followers: {
                [userID]: {name: userName, id: userID}
            }})
            await followers.save()
            await FollowNotifier("follow")
        } else {
            if(!userFollowers.followers){userFollowers.followers = {}}
            if(!userFollowers.followers[userID]){
                userFollowers.followers[userID] = {name: userName, id: userID}
                await Followers.updateOne({userID: newUserID}, {followers: userFollowers.followers})
                await FollowNotifier("follow")
            }
        }

        res.send({successful: true})
    }

    Follow()
}

module.exports = follow