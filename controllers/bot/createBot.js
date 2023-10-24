// const {doc, setDoc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const bot = require('../../models/bot')
// const User = require('../../models/User')
// const botActivities = require('../../models/botActivities')

async function createBot(req, res){
  const {botActivities, User, bot} = req.dbModels
  
    const Bot = req.body.bot
    const userID = req.body.userID
    const id = req.body.id

    
    const newBot = new bot({
        ...Bot
    })
    
    await newBot.save().then(async()=>{
        await saveBotForUser()
        async function saveBotForUser(){
            let thisUser = await User.findOne({id: userID}).lean()

            if(thisUser === null){
              return
            }

            thisUser.bots.push(id)
            // await thisUser.save()
            await User.updateOne({id: userID}, {bots: [...thisUser.bots]})
        }

        await saveBotActivity()
        async function saveBotActivity(){
            const botActivity = await botActivities.findOne({userID})
            if(!botActivity){
              const activities = new botActivities({
                userID,
                otherBotActivities: [],
                userBotActivities: []
              })

              await activities.save()
              return
            }
        }

        res.send({successful: true})
    }).catch(()=>{
        res.send({successful: false})
    })
}

module.exports = createBot