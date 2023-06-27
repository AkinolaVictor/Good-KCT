const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function deleteBotActivity(req, res){
    const userID = req.body.userID
    const activityID = req.body.activityID
    const botActivityRef = doc(database, 'botActivities', userID)
    await getDoc(botActivityRef).then(async(docsnap)=>{
        if(docsnap.exists()){
            const otherBotActivities = [...docsnap.data().otherBotActivities]
            const userBotActivities = [...docsnap.data().userBotActivities]

            for(let i=0; i<otherBotActivities.length; i++){
                if(otherBotActivities[i].activityID === activityID){
                    otherBotActivities.splice(i, 1)
                }
            }

            for(let i=0; i<userBotActivities.length; i++){
                if(userBotActivities[i].activityID === activityID){
                    userBotActivities.splice(i, 1)
                }
            }

            await updateDoc(botActivityRef, {otherBotActivities, userBotActivities}).then(()=>{
                res.send({successful: 'true'})
            })
        }
    }).catch(()=>{
        res.send({successful: 'true'})
    })
}

module.exports = deleteBotActivity