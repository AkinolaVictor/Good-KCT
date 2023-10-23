const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function createTask(req, res){
    const botID = req.body.botID
    const taskData = req.body.taskData
    const botRef = doc(database, 'bots', botID)
    await getDoc(botRef).then(async(snapShot)=>{
        const tasks = [...snapShot.data().tasks]
        tasks.push(taskData)
        await updateDoc(botRef, {tasks}).then(()=>{
            res.send({successful:true, tasks})
        }).catch(()=>{
            res.send({successful:false})
        })
    }).catch(()=>{
        res.send({successful:false})
    })
}

module.exports = createTask