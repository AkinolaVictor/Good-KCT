// bubbleBotUpdate
// const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const botActivities = require('../../models/botActivities')
// const bubble = require('../../models/bubble')

async function bubbleBotUpdate(req, res){
    const {botActivities, bubble} = req.dbModels
    
    const userID = req.body.userID
    const bubbleID = req.body.bubbleID
    const currentBot = req.body.currentBot
    const creatorActivity = req.body.creatorActivity
    const audienceActivity = req.body.audienceActivity
    const currentTask = req.body.currentTask

    // NETWORK
    async function updateCreatorBotActivities(bubbleCreatorID, activity){
        if(bubbleCreatorID !== userID){
            const userBotActivities = await botActivities.findOne({userID: bubbleCreatorID})
            if(userBotActivities === null){
                const newUserBotActivities = new botActivities({
                    userID: bubbleCreatorID, 
                    otherBotActivities: [],
                    userBotActivities: [activity]
                })
                await newUserBotActivities.save()
            } else {
                for(let i=0; i<userBotActivities.userBotActivities.length; i++){
                    const current = userBotActivities.userBotActivities[i]
                    if((current.taskID === activity.taskID) && (current.postID === activity.postID) && (current.audienceID === activity.audienceID)){
                        return
                    }
                }
                userBotActivities.userBotActivities.push(activity)
                await botActivities.updateOne({userID: bubbleCreatorID}, {userBotActivities: [...userBotActivities.userBotActivities]})
                // await userBotActivities.save()
            }
        }
    }

    // NETWORK
    async function updateAudienceBotActivities(bubbleCreatorID, activity){
        if(bubbleCreatorID !== userID){
            const thisBotActivities = await botActivities.findOne({userID})
            if(thisBotActivities === null){
                const newUserBotActivities = new botActivities({
                    userID, 
                    otherBotActivities: [activity],
                    userBotActivities: []
                })
                await newUserBotActivities.save()
            } else {
                for(let i=0; i<thisBotActivities.otherBotActivities.length; i++){
                    const current = thisBotActivities.otherBotActivities[i]
                    if((current.taskID === activity.taskID) && (current.postID === activity.postID) && (current.audienceID === activity.audienceID)){
                        return
                    }
                }
                thisBotActivities.otherBotActivities.push(activity)
                // await thisBotActivities.save()
                await botActivities.updateOne({userID}, {otherBotActivities: [...thisBotActivities.otherBotActivities]})
            }
        }
    }

    const thisBubble = await bubble.findOne({postID: bubbleID}).lean()
    if(thisBubble){
        const bubbleBots = thisBubble.settings.botData
        if(bubbleBots){
            if(bubbleBots[currentBot]){
                const thisBot = bubbleBots[currentBot].audience
                if(thisBot[userID]){
                    const userInBot = thisBot[userID]
                    if(!userInBot.fulfilledTasks.includes(currentTask)){

                        thisBubble.settings.botData[currentBot].audience[userID].fulfilledTasks.push(currentTask)
                        await updateCreatorBotActivities(thisBubble.user.id, creatorActivity)
                        await updateAudienceBotActivities(thisBubble.user.id, audienceActivity)
                        
                        const settings = thisBubble.settings
                        await bubble.updateOne({postID: bubbleID}, {settings})
                        res.send({successful: true})
                    } else {
                        res.send({successful: false, message: 'Bot already acted'})
                    }

                } else {
                    thisBubble.settings.botData[currentBot].audience[userID] = {}
                    thisBubble.settings.botData[currentBot].audience[userID].fulfilledTasks=[]
                    thisBubble.settings.botData[currentBot].audience[userID].fulfilledTasks.push(currentTask)
                    await updateCreatorBotActivities(thisBubble.user.id, creatorActivity)
                    await updateAudienceBotActivities(thisBubble.user.id, audienceActivity)

                    const settings = thisBubble.settings
                    await bubble.updateOne({postID: bubbleID}, {settings})
                    res.send({successful: true})
                }
            } else {
                res.send({successful: false, message: 'Bot not in bubble...'})
            }
        } else {
            res.send({successful: false, message: 'Bubble does not have a botdata'})
        }
    } else {
        res.send({successful: false, message: "bubble not found"})
    }
}

module.exports = bubbleBotUpdate