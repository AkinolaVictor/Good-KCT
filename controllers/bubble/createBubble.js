const sendPushNotification = require('../pushNotification/sendPushNotification')
// const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
// const date = require('date-and-time')
// const {database, storage} = require('../../database/firebase')
// const bot = require('../../models/bot')
// const bubble = require('../../models/bubble')
// const Feeds = require('../../models/Feeds')
// const userBubbles = require('../../models/userBubbles')
// const bubblesForEveryone = require('../../models/bubblesForEveryone')

async function createBubble(req, res){
    const {bubblesForEveryone, userBubbles, Feeds, bubble, bot} = req.dbModels

    const userID = req.body.userID
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
    
    // all file are uploaded on the client side
    saveData_New()

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

    function checkForEveryone(){
        const bubble = [...thisBubble.bubble]

        const audienceNames = []
        for(let i=0; i<bubble.length; i++){
            audienceNames.push(bubble[i].name)
        }

        if(audienceNames.includes('Everyone')){
            return true
        } else {
            return false
        }
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
            // metaData: {}
            data:{
                // type: chosenBubble.name
                type: bubbleName
            }
        }

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

            
            for(let i=0; i<allBubbleAudience.length; i++){
                const followerFeed = await Feeds.findOne({userID: allBubbleAudience[i]})
                if(followerFeed === null){
                    const newUserFeed = new Feeds({userID: allBubbleAudience[i], bubbles: [feedRef]})
                    await newUserFeed.save().then(async()=>{
                        await afterFeedingEachFollower(allBubbleAudience[i])
                    }).catch(()=>{ })
                } else {
                    followerFeed.bubbles.push(feedRef)

                    await Feeds.updateOne({userID: allBubbleAudience[i]}, {bubbles: [...followerFeed.bubbles]}).then(async()=>{
                    // await followerFeed.save().then(async()=>{
                        await afterFeedingEachFollower(allBubbleAudience[i])
                    }).catch(()=>{ })
                }

            }

            async function afterFeedingEachFollower(currentID){
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
        }).then(()=>{
            res.send({successful: true})
        }).catch((e)=>{
            console.log(e);
            res.send({successful: false, message: 'bubble failed to upload to database'})
        })

    }
}

module.exports = createBubble