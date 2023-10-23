const {doc, getDoc, updateDoc, setDoc, deleteField} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
const {database} = require('../../database/firebase')
const notifications = require('../../models/notifications')
const Following = require('../../models/Following')
const Followers = require('../../models/Followers')
const savedAudience = require('../../models/savedAudience')

async function unFollow(req, res){
    const userID = req.body.userID // user.id
    const userName = req.body.userName // user.userInfo.fullname
    const newUserID = req.body.newUserID // props.data.id
    // const newUserName = req.body.newUserName // props.data.userInfo.fullname

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
                userID,
                message: constructMessage(),
                identityStatus: false,
                // feed: thisBubble.refDoc,
                type: 'follow'
            }
            // followData.feed.env='feed'
    
            // check if
            const userNotification = await notifications.findOne({userID: newUserID})
            if(userNotification === null){
                const newNotifications = new notifications({userID: newUserID, all: [followData]})
                await newNotifications.save()
            } else {
                userNotification.all.push(followData)
                // await userNotification.save()
                await notifications.updateOne({userID: newUserID}, {all: [...userNotification.all]})
            }
        }
    }

    const UnFollow = async () => {
        const userFollowing = await Following.findOne({userID}).lean()
        if(userFollowing){
            if(userFollowing.following[newUserID]){
                delete userFollowing.following[newUserID]
                await Following.updateOne({userID}, {following: userFollowing.following})
            }
        }

        
        // remove from user
        const userFollowers = await Followers.findOne({userID: newUserID}).lean()
        if(userFollowers){
            if(userFollowers.followers[userID]){
                delete userFollowers.followers[userID]
                await Followers.updateOne({userID: newUserID}, {followers: userFollowers.followers})
                await FollowNotifier("unfollow")
            }
        }

        // remove from audience
        const userSavedAudience = await savedAudience.findOne({userID: newUserID}).lean()
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
            await savedAudience.updateOne({userID: newUserID}, {
                audience: userSavedAudience.audience
            })
        }

        res.send({successful: true})
    }
    
    UnFollow()
}

module.exports = unFollow