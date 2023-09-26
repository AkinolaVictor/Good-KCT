// bubbleBotUpdate
const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes, deleteObject} = require('firebase/storage')
// const date = require('date-and-time')
const {database} = require('../../database/firebase')

async function bubbleBotUpdate(req, res){
    const userID = req.body.userID
    const bubbleID = req.body.bubbleID
    const currentBot = req.body.currentBot
    const creatorActivity = req.body.creatorActivity
    const audienceActivity = req.body.audienceActivity
    const currentTask = req.body.currentTask



    // NETWORK
    async function updateCreatorBotActivities(bubbleCreatorID, activity){
        if(bubbleCreatorID !== userID){
            const userActivityRef = doc(database, 'botActivities', bubbleCreatorID)
            await getDoc(userActivityRef).then(async(docsnap)=>{
                if(docsnap.exists()){
                    const userBotActivities = [...docsnap.data().userBotActivities]
                    userBotActivities.push(activity)
                    await updateDoc(userActivityRef, {userBotActivities})
                } else {
                    setDoc(userActivityRef, {
                        otherBotActivities: [],
                        userBotActivities: [activity]
                    })
                }
            })
        }
    }

    // NETWORK
    async function updateAudienceBotActivities(bubbleCreatorID, activity){
        if(bubbleCreatorID !== userID){
            const audienceActivityRef = doc(database, 'botActivities', userID)
            await getDoc(audienceActivityRef).then(async(docsnap)=>{
                if(docsnap.exists()){
                    const otherBotActivities = [...docsnap.data().otherBotActivities]
                    otherBotActivities.push(activity)
                    await updateDoc(audienceActivityRef, {otherBotActivities})
                } else {
                    setDoc(audienceActivityRef, {
                        otherBotActivities: [activity],
                        userBotActivities: []
                    })
                }
            })
        }
    }


    const bubbleRef = doc(database, 'bubbles', bubbleID)
    await getDoc(bubbleRef).then(async(snapshot)=>{
        if(snapshot.exists()){
            const posts = {...snapshot.data()}
            const bubbleBots = posts.settings.botData
            if(bubbleBots){
                if(bubbleBots[currentBot]){
                    const thisBot = bubbleBots[currentBot].audience
                    if(thisBot[userID]){
                        const userInBot = thisBot[userID]
                        if(!userInBot.fulfilledTasks.includes(currentTask)){

                            posts.settings.botData[currentBot].audience[userID].fulfilledTasks.push(currentTask)
                            updateCreatorBotActivities(posts.user.id, creatorActivity)
                            updateAudienceBotActivities(posts.user.id, audienceActivity)
                            
                            const settings = posts.settings
                            await updateDoc(bubbleRef, {settings})
                        }

                    } else {
                        posts.settings.botData[currentBot].audience[userID] = {}
                        posts.settings.botData[currentBot].audience[userID].fulfilledTasks=[]
                        posts.settings.botData[currentBot].audience[userID].fulfilledTasks.push(currentTask)
                        updateCreatorBotActivities(posts.user.id, creatorActivity)
                        updateAudienceBotActivities(posts.user.id, audienceActivity)

                        const settings = posts.settings
                        await updateDoc(bubbleRef, {settings})
                    }
                }
            } else {
                res.send({successful: false, message: 'Bot not in bubble...'})
            }
        }
    }).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        res.send({successful: false})
    })
    
}

module.exports = bubbleBotUpdate