const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')
const bot = require('../../models/bot')

async function createTask(req, res){
    const botID = req.body.botID
    const taskData = req.body.taskData

    let thisBot = await bot.findOne({id: botID}).lean()
    
    if(thisBot === null){
      res.send({successful:false, message: 'Bot not found'})
      return
    }
    
    thisBot.tasks.push(taskData)
    await bot.updateOne({id: botID}, {tasks: [...thisBot.tasks]}).then((response)=>{
    // await thisBot.save().then((response)=>{
        res.send({successful:true, tasks: thisBot.tasks})
    }).catch(()=>{
        res.send({successful:false, message: 'Failed to save changes'})
    })
}

module.exports = createTask