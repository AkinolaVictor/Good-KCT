const { v4: uuidv4 } = require('uuid')
const sendPushNotification = require('../pushNotification/sendPushNotification')
// const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
// const {database, storage} = require('../../database/firebase')
// const bot = require('../../models/bot')
// const bubble = require('../../models/bubble')
// const Feeds = require('../../models/Feeds')
// const userBubbles = require('../../models/userBubbles')
// const bubblesForEveryone = require('../../models/bubblesForEveryone')

async function createBubble(req, res){
    const {bubblesForEveryone, userBubbles, Feeds, bubble, bot, hashTags, allUser, notifications} = req.dbModels

    const userID = req.body.userID
    const metaData = req.body.metaData
    const creatorName = req.body.name
    const thisBubble = {...req.body.thisBubble}
    const secrecySettings = thisBubble.settings.secrecyData
    const postID = thisBubble.postID
    const bubbleName = thisBubble.type
    
    
    function discernUserIdentity(){
        if(secrecySettings.atmosphere === 'Night'){
            return true
        } else if(secrecySettings.atmosphere === 'Custom'){
            return true
        } else if(secrecySettings.atmosphere === 'Normal'){
            return true
        } else if(secrecySettings.atmosphere === 'Dark room'){
            return true
        } else if(secrecySettings.atmosphere === 'Man behind the scene'){
            return true
        } else if(secrecySettings.atmosphere === 'Anonymous'){
            return false
        } else if(secrecySettings.atmosphere === 'On mask'){
            return true
        } else if(secrecySettings.atmosphere === 'I see you all'){
            return false
        } else if(secrecySettings.atmosphere === 'Just know its me'){
            return false
        } else {
            return false
        }
    }

    function decideNotifyIcon(){
        const userIcon = thisBubble.user.profilePhoto.length?thisBubble.user.profilePhoto:false
        if(discernUserIdentity() || userIcon === false){
            return false
        } else {
            return userIcon
        }
    }

    function getDate(){
        const now = new Date()
        const time = date.format(now, 'h:mm:ssA')
        const when = date.format(now, 'DD/MM/YYYY')
        const dateString = date.format(now, 'YYYY,MM,DD,HH,mm,ss')
        return {
            time,
            date: when,
            dateString
        }
    }

    async function sendNotificationToMentioned(data){
        const userNotification = await notifications.findOne({userID: data.userID}).lean()
        if(userNotification){
            userNotification.all.push(data.payload)
            await notifications.updateOne({userID: data.userID}, {all: userNotification.all})

            const notificationData = {
                title: `Concealed`,
                body: data.payload.message,
                icon: decideNotifyIcon()
            }

            await sendPushNotification(data.userID, notificationData, req)
        }
    }
    
    // all file are uploaded on the client side
    await saveData_New()

    function checkForEveryoneAndFollowers(){
        const bubble = [...thisBubble.bubble]

        const audienceNames = []
        for(let i=0; i<bubble.length; i++){
            audienceNames.push(bubble[i].name)
        }

        if(audienceNames.includes('Everyone') || audienceNames.includes('My Followers')){
            return true
        } else {
            return false
        }
    }

    function checkForSpecificAudience(testID){
        const bubble = [...thisBubble.bubble]
        for(let i=0; i<bubble.length; i++){
            const curr = bubble[i]
            if(curr.audienceData[testID]){
                return true
            }
        }
        return false
    }

    async function saveData_New(){
        // gather all data to be forwarded as bubble
        // update settings time for self-destructure

        const settings = thisBubble.settings
        settings.selfDestructData.currentDate = thisBubble.createdDate


        const botData = [...Object.keys(settings.botData)]
        if(botData.length){
            for(let k=0; k<botData.length; k++){
                const eachBot = botData[k]
                const thisBot = await bot.findOne({id: eachBot}).lean()
                if(thisBot){
                    if(!thisBot.data.includes(postID)){
                        thisBot.data.push(postID)
                        // await thisBot.save()
                        await bot.updateOne({id: eachBot}, {data: [...thisBot.data]})
                    }
                }
            }
        }


        const feedRef = {
            userID,
            postID,
            type: 'Ref',
            status: 'active',
            sharePath:[userID],
            metaData: {...metaData, aos: secrecySettings.atmosphere},
            data:{
                // type: chosenBubble.name
                type: bubbleName
            }
        }

        thisBubble.feedRef = feedRef
        // console.log(feedRef.metaData);
        // const {metaData} = feedRef
        // const userHashs = [...Object.keys(metaData.hash)]
        // console.log(feedRef.metaData);

        // res.send({successful: false, message: 'bubble failed to upload to database'})
        // return

        const allBubbleAudience = [...thisBubble.audience]
        for(let i=0; i<allBubbleAudience.length; i++){
            thisBubble.activities.iAmOnTheseFeeds[allBubbleAudience[i]] = {
                index: Object.keys(thisBubble.activities.iAmOnTheseFeeds).length,
                onFeed: true, 
                mountedOnDevice: false,
                userID: allBubbleAudience[i],
                myImpressions: 0,
                seenAndVerified: false,
                replyPath: [],
                myActivities: {
                }
            }
        }

        // DO ALL STRINGIFY HERE
        const emptyReply = []
        const emptyShareStructure = {}
        const activities = {...thisBubble.activities}

        thisBubble.reply = JSON.stringify(emptyReply)
        thisBubble.shareStructure = JSON.stringify(emptyShareStructure)
        thisBubble.activities = JSON.stringify(activities)
        // thisBubble.settings = JSON.stringify(settings)

        // setup bubble creation 
        // New data structure

        thisBubble.audience = []
        
        const newBubble = new bubble({...thisBubble})
        await newBubble.save().then(async()=>{
            // update user feed
            const userFeed = await Feeds.findOne({userID}).lean()
            if(userFeed === null){
                const feeds = new Feeds({userID, bubbles: [feedRef]})
                await feeds.save().catch(()=>{ })
            } else {
                userFeed.bubbles.push(feedRef)
                // await userFeed.save().catch(()=>{ })
                await Feeds.updateOne({userID}, {bubbles: [...userFeed.bubbles]}).catch(()=>{ })
            }

            
            // update user bubble
            const allUserBubbles = await userBubbles.findOne({userID}).lean()
            if(allUserBubbles === null){
                const bubbles = new userBubbles({userID, bubbles: [feedRef]})
                await bubbles.save().catch(()=>{ })
            } else {
                allUserBubbles.bubbles.push(feedRef)    
                // await allUserBubbles.save().catch(()=>{ })
                await userBubbles.updateOne({userID}, {bubbles: [...allUserBubbles.bubbles]}).catch(()=>{ })
            }

            async function checkThroughAudienceSettings(ID){
                const secrecySettings = thisBubble.settings.secrecyData.atmosphere
                const followerDetails = await User.findOne({userID: ID}).lean()
                
                if(followerDetails === null){
                    return false
                }

                const {settings} = followerDetails
                if(secrecySettings === "None"){
                    return true
                } else {
                    if(!settings){
                        return true
                    } else {
                        if(settings.secrecy.value === "Everyone"){
                            return true
                        } else if(settings.secrecy.value === "Followings"){
                            const followingDetails = await Following.findOne({userID: ID}).lean()
                            if(!followingDetails){
                                return false
                            } else {
                                const allFollowings = followingDetails.following
                                if(allFollowings[userID]){
                                    return true
                                } else {
                                    return false
                                }
                            }
                        } else if(settings.secrecy.value === "Nobody"){
                            return false
                        } else {
                            return true
                        }
                    }
                }
            }
            
            for(let i=0; i<allBubbleAudience.length; i++){
                // if(await checkThroughAudienceSettings(allBubbleAudience[i])){
                    const followerFeed = await Feeds.findOne({userID: allBubbleAudience[i]})
                    if(followerFeed === null){
                        const newUserFeed = new Feeds({userID: allBubbleAudience[i], bubbles: [feedRef]})
                        await newUserFeed.save().then(async()=>{
                            await afterFeedingEachFollower_Send_notification(allBubbleAudience[i])
                        }).catch(()=>{ })
                    } else {
                        followerFeed.bubbles.push(feedRef)
    
                        await Feeds.updateOne({userID: allBubbleAudience[i]}, {bubbles: [...followerFeed.bubbles]}).then(async()=>{
                            await afterFeedingEachFollower_Send_notification(allBubbleAudience[i])
                        }).catch(()=>{ })
                    }
                // }
            }

            async function afterFeedingEachFollower_Send_notification(currentID){
                function constructTitle(){
                    if(discernUserIdentity()){
                        return "someone you're following created a bubble"
                    } else {
                        return `${thisBubble.user.name} created a bubble`
                    }
                }

                const discernMessage = () => {
                    const bubble = thisBubble.bubble
                    for(let i=0; i<bubble.length; i++){
                        if(bubble[i].name==='Everyone'){
                            let message = ''

                            // building message
                            const config = bubble[i].config
                            for(let j=0; j<config.length; j++){
                                const tweak = config[j].tweak
                                const word = config[j].word
                                if(word ==='(%%%---!!!@@@###&&&)'){
                                } else if( word ==='(%%%%----!!!!@@@@####&&&&)'){
                                } else {
                                    if(tweak.name === 'none'){
                                        message = message + `${word} `
                                    } else if (tweak.name ==='description'){
                                        message = message + `${word} `
                                    } else if (tweak.name ==='hide'){
                                        // message = message + `${word} `
                                    } else{
                                        message = message + `*** `
                                    }
                                }
                            }
                            return message.length?message:`You're selected among those who can view the content of this bubble.`
                        } else {
                            if(bubble[i].audience.includes(currentID)){
                                let message = ''

                                // building message
                                const config = bubble[i].config
                                for(let j=0; j<config.length; j++){
                                    const tweak = config[j].tweak
                                    const word = config[j].word
                                    if(tweak.name === 'none'){
                                        message = message + `${word} `
                                    } else if (tweak.name ==='description'){
                                        message = message + `${word} `
                                    } else if (tweak.name ==='hide'){
                                        // message = message + `${word} `
                                    } else{
                                        message = message + `*** `
                                    }
                                }


                                return message.length?message:`You're selected among those who can view the content of this bubble.`
                            } else {
                                return `You're selected among those who can view the content of this bubble.`
                            }
                        }
                    }
                    return `You're selected among those who can view the content of this bubble.`
                }

                const data = {
                    title: `${constructTitle()}`,
                    body: discernMessage(),
                    icon: decideNotifyIcon()
                }

                await sendPushNotification(currentID, data, req)
            }

            if(checkForEveryoneAndFollowers()){
                const publicBubbles = await bubblesForEveryone.findOne({name: "Everyone"})
                if(publicBubbles === null){
                    const newPublicBubbles = new bubblesForEveryone({name: "Everyone", bubbleRefs: [feedRef]})
                    await newPublicBubbles.save().then(()=>{})
                } else {
                    publicBubbles.bubbleRefs.push(feedRef)
                    await bubblesForEveryone.updateOne({name: "Everyone"}, {bubbleRefs: [...publicBubbles.bubbleRefs]}).catch(()=>{})
                    // await publicBubbles.save().then(()=>{})
                }
            }

            // register/count hashtag
            const metaHash = feedRef.metaData.hash||{}
            const userHashs = [...Object.keys(metaHash)]
            const userHashTags = await hashTags.findOne({title: "batch_1"}).lean()
            if(userHashTags === null){
                const saveHash = {}
                for(let i=0; i<userHashs.length; i++){
                    saveHash[userHashs[i]] = {
                        hash: userHashs[i],
                        count: {bub: 1},
                        lastDate: getDate()
                    }
                }

                const newHash = new hashTags({
                    title: "batch_1", 
                    allHashs: {
                        ...saveHash
                    }
                })

                await newHash.save()
            } else {
                const {allHashs} = userHashTags
                // if(Object.keys(hashTags).length <= 500){
                for(let i=0; i<userHashs.length; i++){
                    if(allHashs[userHashs[i]]){
                        allHashs[userHashs[i]].count.bub++
                        allHashs[userHashs[i]].lastDate = getDate()
                    } else {
                        allHashs[userHashs[i]] = {
                            hash: userHashs[i],
                            count: {bub: 1},
                            lastDate: getDate()
                        }
                    }
                }
                // await hashTags.findOneAndUpdate({title: "batch_1"}, {allHashs})
                await hashTags.updateOne({title: "batch_1"}, {allHashs})
                // }
            }

            // mention

            const metaMentions = feedRef.metaData.mention||{}
            const userMentioned = [...Object.keys(metaMentions)]
            if(userMentioned.length){
                const allConcealedUsers = await allUser.findOne({name: "concealed"}).lean()
                if(allConcealedUsers){
                    const {users} = allConcealedUsers
                    const userArr = Object.values(users)
                    for(let i=0; i<userMentioned.length; i++){
                        const curretMentioned = userMentioned[i]
                        for(let j=0; j<userArr.length; j++){
                            const currentUser = userArr[j]
                            if(currentUser.username.toLowerCase() === curretMentioned.toLowerCase()){
                                const data = {
                                    userID: currentUser.userID,
                                    payload: {
                                        time: getDate(),
                                        message: `${creatorName} mentioned you in a bubble`,
                                        userID,
                                        feed: feedRef,
                                        type: "mention",
                                        creatorID: userID,
                                        bubbleID: thisBubble.postID,
                                        id: uuidv4(),
                                        identityStatus: discernUserIdentity()
                                    }
                                }

                                if(checkForEveryoneAndFollowers() || checkForSpecificAudience(currentUser.userID)){
                                    if(currentUser.userID !== userID){
                                        await sendNotificationToMentioned(data)
                                    }
                                }
                            }
                        }
                    }
                }
            }

        }).then(()=>{
            res.send({successful: true})
        }).catch((e)=>{
            console.log(e);
            res.send({successful: false, message: 'bubble failed to upload to database'})
        })

    }
}

module.exports = createBubble