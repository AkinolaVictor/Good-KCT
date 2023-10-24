// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const bot = require('../../models/bot')

async function editTask(req, res){
    const {bot} = req.dbModels
    
    const botID = req.body.botID
    const taskID = req.body.taskID
    const freshData = req.body.freshData

    
    let thisBot = await bot.findOne({id: botID}).lean()

    if(!thisBot){
        res.send({successful:false, message: 'Bot not found'})
        return
    }
    
    const savedTasks = thisBot.tasks
    for(let i=0; i<savedTasks.length; i++){
        if(savedTasks[i].id === taskID){
            savedTasks[i] = freshData
        }
    }
    
    const _id = thisBot._id
    await bot.findByIdAndUpdate(_id, {tasks: savedTasks}).then(()=>{
        res.send({successful:true, tasks: savedTasks})
    }).catch(()=>{
        res.send({successful:false, message: 'Failed to update changes'})
    })
}

module.exports = editTask