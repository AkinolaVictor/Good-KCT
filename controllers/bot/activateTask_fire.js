const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')
const bot = require('../../models/bot')

async function activateTask(req, res){
    const botID = req.body.botID
    const taskID = req.body.taskID



    const botRef = doc(database, 'bots', botID)
    await getDoc(botRef).then(async(docsnap)=>{
        const tasks = [...docsnap.data().tasks]
        for(let i=0; i<tasks.length; i++){
            if(tasks[i].id === taskID){
                tasks[i].status = 'Active'
            }
        }
        await updateDoc(botRef, {tasks}).then(()=>{
            res.send({successful:true, tasks})
        }).catch(()=>{
            res.send({successful:false})
        })
    }).catch(()=>{
        res.send({successful:false})
    })
}

module.exports = activateTask