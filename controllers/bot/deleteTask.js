const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function deleteTask(req, res){
    const botID = req.body.botID
    const taskID = req.body.taskID
    const botRef = doc(database, 'bots', botID)
    await getDoc(botRef).then(async(snapshot)=>{
        const tasks = [...snapshot.data().tasks]
        for(let i=0; i<tasks.length; i++){
            if(tasks[i].id === taskID){
                tasks.splice(i, 1)
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

module.exports = deleteTask