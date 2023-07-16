const {doc, getDoc, updateDoc, setDoc, increment} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const { v4: uuidv4 } = require('uuid')
const date = require('date-and-time')
const {database} = require('../../database/firebase')

async function botBubbleUpdate(req, res){
    const bubbleID = req.body.bubbleID
    const userID = req.body.userID
    const data = req.body.data // path
    

    const docz = doc(database, 'bubbles', bubbleID)
    await getDoc(docz).then(async(snapshot)=>{
        if(snapshot.exists()){
            const posts = {...snapshot.data()}
            const botsData = posts.settings.botData
            const loopData = [...data]
            for(let i=0; i<loopData.length; i++){
                const eachData = loopData[i]
                let currentBot = eachData.currentBot, currentTask = eachData.currentTask,
                    creatorActivity = eachData.creatorActivity, audienceActivity = eachData.audienceActivity
                    // if bot still exists in bubbles
                    if(botsData[currentBot]){
                        const thisBotData = botsData[currentBot].audience
                        if(thisBotData[userID]){
                            if(!thisBotData[user.id].fulfilledTasks.includes(currentTask)){
                                posts.settings.botData[currentBot].audience[userID].fulfilledTasks.push(currentTask)
                                updateCreatorBotActivities(creatorActivity)
                                updateAudienceBotActivities(audienceActivity)
                            }
                        } else {
                            posts.settings.botData[currentBot].audience[userID] = {}
                            posts.settings.botData[currentBot].audience[userID].fulfilledTasks=[]
                            posts.settings.botData[currentBot].audience[userID].fulfilledTasks.push(currentTask)
                            updateCreatorBotActivities(creatorActivity)
                            updateAudienceBotActivities(audienceActivity)
                        }
        
                        const settings = posts.settings
                        updateDoc(bubbleRef, {settings})
                    }
            }

            
        }
    }).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        res.send({successful: false, message: 'An error occured from the server side'})
    })

    
}

module.exports = botBubbleUpdate