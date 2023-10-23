const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')
const bot = require('../../models/bot')

async function deleteTask(req, res){
    const botID = req.body.botID
    const taskID = req.body.taskID

    let thisBot = await bot.findOne({id: botID}).lean()

    if(thisBot === null){
        res.send({successful:false, message: 'Bot not found'})
        return
    }
    
    for(let i=0; i<thisBot.tasks.length; i++){
        if(thisBot.tasks[i].id === taskID){
            thisBot.tasks.splice(i, 1)
        }
    }
    
    await bot.updateOne({id: botID}, {tasks: [...thisBot.tasks]}).then((response)=>{
    // await thisBot.save().then((response)=>{
        res.send({successful:true, tasks: thisBot.tasks})
    }).catch(()=>{
        res.send({successful:false, message: 'Failed to save changes'})
    })
}

module.exports = deleteTask