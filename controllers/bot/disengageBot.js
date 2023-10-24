// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const bubble = require('../../models/bubble')
// const bot = require('../../models/bot')

async function disengageBot(req, res){
    const {bot, bubble} = req.dbModels
    
    const userID = req.body.userID
    const botID = req.body.botID
    const postID = req.body.postID
    // const taskID = req.body.taskID

    const thisBubble = await bubble.findOne({postID}).lean()
    if(thisBubble === null){
        res.send({successful:false, message: 'Server Error: failed to disengage bot'})
        return 
    }

    const post = {...thisBubble}
    const allBots = post.settings.botData
    if(allBots[botID]){
        const thisBot = await bot.findOne({id: botID}).lean()
        if(!thisBot){
            res.send({successful:false, message: 'Server Error: bot was not found'})
            return
        }

        for(let i=0; i<thisBot.data.length; i++){
            if(thisBot.data[i]===postID){
                thisBot.data.splice(i, 1)
            }
        }

        await bot.updateOne({id: botID}, {data: thisBot.data}).then(async ()=>{
        // await thisBot.save().then(async ()=>{
            // console.log("i got here");
            delete post.settings.botData[botID]
            const settings = post.settings
            await bubble.updateOne({postID}, {settings})    
            res.send({successful: true, bot: thisBot})
        }).catch(()=>{
            res.send({successful: false, message: "failed to save bot"})
        })
    }
}

module.exports = disengageBot