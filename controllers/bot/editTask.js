const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function editTask(req, res){
    const botID = req.body.botID
    const taskID = req.body.taskID
    const freshData = req.body.freshData

    const botRef = doc(database, 'bots', botID)
    await getDoc(botRef).then(async(snapshot)=>{
        const tasks = [...snapshot.data().tasks]
        for(let i=0; i<tasks.length; i++){
            if(tasks[i].id === taskID){
                tasks[i] = freshData
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

module.exports = editTask