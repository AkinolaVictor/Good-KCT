const { v4: uuidv4 } = require('uuid')
const sendPushNotification = require('../pushNotification/sendPushNotification')
const date = require('date-and-time')
const sendPushNotification_2 = require('../pushNotification/sendPushNotification_2')

async function createBubble_v2(req, res) {
    const {bubblesForEveryone, userBubbles, Feeds, bubble, bot, hashTags, allUser, notifications, bubbleRanks} = req.dbModels
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
    
    async function sendNotificationToMentioned({dataArr, feedRef}){
        const allIds = []

        const payload = {
            when: new Date().toISOString(),
            message: `${creatorName} mentioned you in a bubble`,
            userID,
            feed: feedRef,
            type: "mention",
            creatorID: userID,
            bubbleID: postID,
            id: uuidv4(),
            identityStatus: discernUserIdentity()
        }

        const notificationData = {
            title: `Imole`,
            body: payload.message,
            data: {
                type: "bubble",
                // userID,
                feed: feedRef
            }
            // icon: decideNotifyIcon()
        }

        for(let i=0; i<dataArr.length; i++){
            const id = dataArr[i]

            if(!allIds.includes(id)) allIds.push(id)

            const userNotification = await notifications.findOne({userID: id}).lean()
            if(userNotification){
                userNotification.all.push(payload)
                await notifications.updateOne({userID: id}, {all: userNotification.all})
                // await sendPushNotification(data.userID, notificationData, req)
            }
        }

        await sendPushNotification_2({
            userIDs: [...dataArr],
            data: notificationData,
            req
        })
    }

    async function createRankData({feedRef}){
        if(!feedRef) return
        const metadata = feedRef?.metaData||{}
        // const {audience, aos, hash, text, image, video} = metaData

        const cont = {
            userID,
            postID,
            engagement: {},
            metadata,
            lastengaged: new Date().toISOString()
        }

        const rankData = new bubbleRanks({...cont})
        await rankData.save()
    }
    
    function checkForEveryoneAndFollowers({aiAud}){
        const bubble = [...thisBubble.bubble]

        const audienceNames = []
        for(let i=0; i<bubble.length; i++){
            audienceNames.push(bubble[i].name)
        }

        if(aiAud){
            if(audienceNames.includes('Ai Audience')){
                return true
            }
        }
        if(audienceNames.includes('Everyone') || audienceNames.includes('My Followers') || audienceNames.includes('Ai Audience')){
            return true
        } else {
            return false
        }
    }

    function checkForSpecificAudience(testID){
        const bubble = [...thisBubble.bubble]
        for(let i=0; i<bubble.length; i++){
            const curr = bubble[i]
            if(curr?.audienceData?.[testID]){
                return true
            }
        }
        return false
    }

    async function appendToBot(){
        const settings = thisBubble.settings
        // settings.selfDestructData.currentDate = new Date().toISOString()

        // thisBubble.settings.selfDestructData.currentDate = new Date().toISOString()

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
    }

    function buildFeedRef(){
        const feedRef = {
            userID,
            postID,
            type: 'Ref',
            status: 'active',
            sharePath:[userID],
            metaData: {...metaData, aos: secrecySettings.atmosphere},
            data:{
                type: bubbleName
            }
        }
        
        const bublx = thisBubble.bubble
        const meta = {text: 0, image: 0, video: 0}
        for(let i=0; i<bublx.length; i++){
            const {message, file} = bublx[i]
            if(message.length>1){
                meta.text++
            }

            for(let j=0; j<file.length; j++){
                const type = file[j]?.type||[]
                const which = type[0]
                if(which==="video"){
                    meta.video++
                }

                if(which==="image"){
                    meta.image++
                }
            }
        }

        feedRef.metaData = {...feedRef.metaData, ...meta}
        return feedRef
    }

    function compileBubble({feedRef}){
        thisBubble.feedRef = feedRef

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
        
        thisBubble.audience = []

        return thisBubble
    }

    async function updateMyFeed({feedRef}){
        // update user feed
        const userFeed = await Feeds.findOne({userID}).lean()
        if(userFeed === null){
            const feeds = new Feeds({userID, bubbles: [feedRef]})
            await feeds.save().catch(()=>{ })
        } else {
            userFeed.bubbles.push(feedRef)
            await Feeds.updateOne({userID}, {bubbles: [...userFeed.bubbles]}).catch(()=>{ })
            // await userFeed.save().catch(()=>{ })
        }
    }

    async function updateMyBubbleList({feedRef}){
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
    }
            
    async function afterFeedingEachFollower_Send_notification({currentID, thisBubble}){
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
                    // if(bubble[i].audience.includes(currentID)){
                    //     let message = ''

                    //     // building message
                    //     const config = bubble[i].config
                    //     for(let j=0; j<config.length; j++){
                    //         const tweak = config[j].tweak
                    //         const word = config[j].word
                    //         if(tweak.name === 'none'){
                    //             message = message + `${word} `
                    //         } else if (tweak.name ==='description'){
                    //             message = message + `${word} `
                    //         } else if (tweak.name ==='hide'){
                    //             // message = message + `${word} `
                    //         } else{
                    //             message = message + `*** `
                    //         }
                    //     }
                    //     return message.length?message:`You're selected among those who can view the content of this bubble.`
                    // } else {
                    //     return `You're selected among those who can view the content of this bubble.`
                    // }
                    return `You're selected among those who can view the content of this bubble.`
                }
            }

            return `You're selected among those who can view the content of this bubble.`
        }

        const data = {
            title: `${constructTitle()}`,
            body: discernMessage(),
            data: {
                type: "bubble",
                // userID,
                feed: feedRef   
            }
        }

        await sendPushNotification_2({
            userIDs: [...currentID],
            data, req
        })
    }

    async function serveBubble({feedRef, allBubbleAudience, thisBubble}) {
        
        const savedIDs = []
        for(let i=0; i<allBubbleAudience.length; i++){
            const followerFeed = await Feeds.findOne({userID: allBubbleAudience[i]})
            if(followerFeed === null){
                const newUserFeed = new Feeds({userID: allBubbleAudience[i], bubbles: [feedRef]})
                await newUserFeed.save().then(async()=>{}).catch(()=>{ })
            } else {
                followerFeed.bubbles.push(feedRef)
                await Feeds.updateOne({userID: allBubbleAudience[i]}, {bubbles: [...followerFeed.bubbles]}).then(async()=>{}).catch(()=>{ })
            }
            if(!savedIDs.includes(allBubbleAudience[i])) savedIDs.push(allBubbleAudience[i])
        }
                
        await afterFeedingEachFollower_Send_notification({
            currentID: savedIDs,
            multiple: true,
            thisBubble
        })
    }
    
    async function saveData_New(){
        await appendToBot()
        const feedRef = buildFeedRef()
        const thisBubble = compileBubble({feedRef})

        const newBubble = new bubble({...thisBubble})
        await newBubble.save().then(async()=>{
            await updateMyBubbleList({feedRef})
            await updateMyFeed({feedRef})
            await createRankData({feedRef})
            await serveBubble({feedRef, allBubbleAudience: [], thisBubble})

        }).then(()=>{
            res.send({successful: true})
        }).catch((e)=>{
            console.log(e);
            res.send({successful: false, message: 'bubble failed to upload to database'})
        })
    }
}