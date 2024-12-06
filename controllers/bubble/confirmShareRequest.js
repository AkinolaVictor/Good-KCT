const date = require('date-and-time')
const sendPushNotification = require('../pushNotification/sendPushNotification')
const sendPushNotification_2 = require('../pushNotification/sendPushNotification_2')
// const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const { v4: uuidv4 } = require('uuid')
// const {database} = require('../../database/firebase')
// const { dataType } = require('../../utils/utilsExport')
// const notifications = require('../../models/notifications')
// const bubble = require('../../models/bubble')
// const Feeds = require('../../models/Feeds')
// const Followers = require('../../models/Followers')

async function confirmShareRequest(req, res){
    const {Feeds, Followers, bubble, notifications, eachUserAnalytics, User} = req.dbModels
    
    const userID = req.body.userID // user.id
    let data = req.body.data
    let pathOfShare = [...data.feed.sharePath]
    // console.log(pathOfShare);
    // const thisBubble = {...req.body.thisBubble}
    
    let overallShare = []
    let eachShare = {}
    function spreadShare(path, pathLength, shareStructure){
        let pathClone = [...path]
        if (pathClone.length<pathLength){
            let old = {...eachShare}
            eachShare = {...old[pathClone[0]]}
        }else{
            // eachShare = {...thisBubble.shareStructure[pathClone[0]]}
            eachShare = {...shareStructure[pathClone[0]]}
        }
        overallShare.push(eachShare)
        pathClone.shift()
        // recurrsion
        if (pathClone.length!==0) {
            spreadShare(pathClone, pathLength, shareStructure)
        }
    }

    function buildShare(path){
        // this function builds out the share into a singular nested objects of share: that is, {...,share:{...,share:{...,share:{...}}}}
        const usePath = [...path]
        if(overallShare.length>1){
            for (let i=overallShare.length-1; i>0; i=i-1){
                overallShare[i-1][usePath[i]] = {...overallShare[i]}
            }
            return overallShare[0]
        } else {
            return overallShare[0]
        }
    }

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

    async function updateUserAnalytics(thisBubble){
        const userAnalytics = await eachUserAnalytics.findOne({userID: thisBubble.user.id}).lean()
        if(userAnalytics === null){
            const data = {
                userID: thisBubble.user.id, 
                bubbles: {
                    [userID]: {
                        impressions: 1, replys: 0, likes: 0, shares: 1,
                        bubbleIDs: [thisBubble.postID]
                    }
                }, 
                profile: {
                    [userID]: {
                        follow: 0, 
                        views: 0
                    }
                },
                date: {}
                // date: {...getDate()}
            }
            const newUserAnalytics = new eachUserAnalytics({...data})
            await newUserAnalytics.save()
        } else {
            const {bubbles} = userAnalytics
            if(!bubbles[userID]){
                bubbles[userID] = {
                    impressions: 1,
                    shares: 1, replys: 0, likes: 0,
                    bubbleIDs: [thisBubble.postID]
                }
            } else {
                bubbles[userID].shares++
                if(!bubbles[userID].bubbleIDs.includes(thisBubble.postID)){
                    bubbles[userID].bubbleIDs.push(thisBubble.postID)
                }
            }
            await eachUserAnalytics.updateOne({userID: thisBubble.user.id}, {bubbles})
        }
    }

    async function confirmRequest(){
        // update my notification
        await shareBubble(notify)
        async function notify(){
            const userNotification = await notifications.findOne({userID}).lean()
            if(userNotification){
                for(let i=0; i<userNotification.all.length; i++){
                    if(userNotification.all[i].id === data.id && userNotification.all[i].type==='shareRequest'){
                        userNotification.all[i].status = 'granted'
                        await notifications.updateOne({userID}, {all: [...userNotification.all]})
                        // await userNotification.save()
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
                    // url: "/main/bubbles/subReply",
                    type: "bubble",
                    // replyPath: [...newPath],
                }
                // icon: false
            }
            await sendPushNotification(data.userID, thisData, req)
            await sendPushNotification_2({
                userIDs: [data.userID],
                data: thisData,
                req
            })
        }
    }

    const discernPrevShares = () => {
        // if i'm the last person to share
        // if(pathOfShare.length==1 && pathOfShare[pathOfShare.length-1]===userID){
        if(pathOfShare.length>=1 && pathOfShare[pathOfShare.length-1]===data.userID){
            return pathOfShare
        } else {
            return [...pathOfShare, data.userID]
        }
    }

    async function shareBubble(notify){
        try{
            const thisBubble = await bubble.findOne({postID: data.feed.postID}).lean()
            if(thisBubble){
                let shareStructure = {}
                if(typeof(thisBubble.shareStructure) === "string"){
                    shareStructure = JSON.parse(thisBubble.shareStructure)
                } else {
                    shareStructure = thisBubble.shareStructure
                }
    
                if(typeof(thisBubble.activities)==="string"){
                    const activities = JSON.parse(thisBubble.activities)
                    thisBubble.activities = activities
                }
    
                // THIS HAS TO BE DONE ON TOP SO AS TO PRESERVE "data.feed.sharePath"
                if( pathOfShare[pathOfShare.length - 1]!==data.userID){
                    const mainPath = [...data.feed.sharePath]
                    mainPath.shift()
                    const path2 = [...mainPath]
                    if(path2.length>1){
                        spreadShare(path2, path2.length, shareStructure)
                        if(overallShare[overallShare.length-1][data.userID]===undefined){
                            overallShare[overallShare.length-1][data.userID] = {}
                            // build destructured share
                            const finalProduct = buildShare(path2)
                            shareStructure[path2[0]] = finalProduct
                        }
                    } else if(path2.length===1){
                        shareStructure[path2[0]][data.userID]={}
                    } else {
                        shareStructure[data.userID]={}
                    }
    
                }
                // if sharing a reply, first update the audience requesting for permission
                if(data.feed.data.path.length){
                    // if audience already got this reply
                    const current = thisBubble.activities.iAmOnTheseFeeds[data.userID].replyPath
                    if(!current.includes(`${data.feed.data.path}`)){
                        const audienceFeed = await Feeds.findOne({userID: data.userID}).lean()
                        if(audienceFeed){
                            thisBubble.activities.iAmOnTheseFeeds[data.userID].replyPath.push(`${data.feed.data.path}`)
                            data.feed.sharePath = discernPrevShares()
                            audienceFeed.bubbles.push(data.feed)
                            await Feeds.updateOne({userID: data.userID}, {bubbles: audienceFeed.bubbles})
                            // await audienceFeed.save()
                        }
                    }
                }
    
                const userFollowers = await Followers.findOne({userID: data.userID})
                if(userFollowers){
                    const followers = [...Object.keys(userFollowers.followers)]
                    const feedRef = thisBubble?.feedRef||{metaData: {}}
                    const {loc, gend} = feedRef?.metaData||{}
                    for(let i=0; i<followers.length; i++){
                        // if you're not sharing a reply
                        if(loc || gend){
                            const cacheUser = await User.findOne({id: followers[i]}).lean()
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

                        // check if bubble does not contains a reply
                        if(!data.feed.data.path.length){
                            // check if this follower has gotten it before
                            if(!thisBubble.activities.iAmOnTheseFeeds[followers[i]]){
                                thisBubble.activities.iAmOnTheseFeeds[followers[i]]={
                                    index: Object.keys(thisBubble.activities.iAmOnTheseFeeds).length,
                                    onFeed: true, 
                                    userID: followers[i],
                                    mountedOnDevice: false, 
                                    seenAndVerified: false,
                                    myImpressions: 0,
                                    replyPath: [],
                                    bots: {},
                                    myActivities: {
                                        
                                    }
                                }
                                const followerFeed = await Feeds.findOne({userID: followers[i]}).lean()
                                if(followerFeed){
                                    data.feed.sharePath = discernPrevShares()
                                    followerFeed.bubbles.push(data.feed)
                                    await Feeds.updateOne({userID: followers[i]}, {bubbles: followerFeed.bubbles})
                                    // await followerFeed.save()
                                }
                            }
                        } else {
                            // check if this follower has gotten it before
                            if(!thisBubble.activities.iAmOnTheseFeeds[followers[i]]){
                                thisBubble.activities.iAmOnTheseFeeds[followers[i]]={
                                    index: Object.keys(thisBubble.activities.iAmOnTheseFeeds).length,
                                    onFeed: true, 
                                    userID: followers[i],
                                    mountedOnDevice: false,
                                    seenAndVerified: false,
                                    myImpressions: 0,
                                    replyPath: [`${data.feed.data.path}`],
                                    bots: {},
                                    myActivities: {
                                    }
                                }
                            } else {
                                // follower has seen this bubble befor but check if he has recieved the reply
                                const current = thisBubble.activities.iAmOnTheseFeeds[followers[i]].replyPath
                                if(!current.includes(`${data.feed.data.path}`)){
                                    thisBubble.activities.iAmOnTheseFeeds[followers[i]].replyPath.push(`${data.feed.data.path}`)
                                } else {
                                    // if user already has the replies skip the remaining codes and move to the next counter
                                    continue
                                }
                                const followerFeed = await Feeds.findOne({userID: followers[i]}).lean()
                                if(followerFeed){
                                    data.feed.sharePath = discernPrevShares()
                                    followerFeed.bubbles.push(data.feed)
                                    await Feeds.updateOne({userID: followers[i]}, {bubbles: followerFeed.bubbles})
                                    // await followerFeed.save()
                                }
                            }
                        }
    
    
                    }
                }
    
    
                // decrease share request
                if(thisBubble.activities.permissionRequests>0){
                    thisBubble.activities.permissionRequests--
                }
                // update activities of the person sharing this bubble
                if(thisBubble.activities.iAmOnTheseFeeds[data.userID].myActivities.activityIndex){
                } else {
                    thisBubble.activities.lastActivityIndex++
                    thisBubble.activities.iAmOnTheseFeeds[data.userID].myActivities.activityIndex = thisBubble.activities.lastActivityIndex
                }
                thisBubble.activities.iAmOnTheseFeeds[data.userID].myActivities.shared=true
                thisBubble.activities.iAmOnTheseFeeds[data.userID].seenAndVerified=true
                // increase count
                thisBubble.activities.shares++
                if(!thisBubble.activities.allWhoHaveShared[data.userID]){
                    thisBubble.activities.allWhoHaveShared[data.userID]=true
                }
                // update last activity
                if(!thisBubble.activities.lastActivities){
                    thisBubble.activities.lastActivities=[]
                }
                const thisActivity = 'shared'
                const lastActivities = thisBubble.activities.lastActivities
                const activityData = {
                    activity: thisActivity,
                    userID: data.userID,
                    date: getDate()
                }
    
                if(lastActivities.length>0){
                    const last = lastActivities[lastActivities.length - 1]
                    // if the last activity that happen is not the same as this
                    if(last.activity!==thisActivity){
                        for(let i=0; i<lastActivities.length; i++){
                            const current = lastActivities[i]
                            // if this user already has this activity in the stack of activities
                            if(current.userID===data.userID && current.activity===thisActivity){
                                break
                            }
    
                            if(i===lastActivities.length-1){
                                thisBubble.activities.lastActivities.push(activityData)
                                if(thisBubble.activities.lastActivities.length>10){
                                    thisBubble.activities.lastActivities.shift()
                                }
                                // updateFunc()
                            }
                        }
                    }
                } else {
                    thisBubble.activities.lastActivities.push(activityData)
                    // updateFunc()
                }
                // update post
                const activities = JSON.stringify(thisBubble.activities)
                const savedShareStructure = JSON.stringify(shareStructure)
                await bubble.updateOne({postID: data.feed.postID}, {activities, shareStructure: savedShareStructure})
                await updateUserAnalytics(thisBubble)
                await notify()
                
                res.send({successful: true})
            } else {
                res.send({successful: false, message: 'bubble not found'})
            }
        } catch(e) {
            console.log(e);
            res.send({successful: false, message: 'Network error: failed to share bubble'})
        }
    }
    
    // await confirmRequest()

    try {
        await confirmRequest()
    } catch(e) {
        console.log(e);
        console.log("something went wrong along the line");
        res.send({successful: false, message: "something went wrong along the line"})
    }

}

module.exports = confirmShareRequest