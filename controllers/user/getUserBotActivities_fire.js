const {doc, getDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function getUserBotActivities(req, res){
    let userID = req.body.userID

    const botActivityRef = doc(database, 'botActivities', userID)
    await getDoc(botActivityRef).then((docsnap)=>{
        if(docsnap.exists()){
            const botActivities = {...docsnap.data()}
            res.send({successful: true, botActivities})
        } else {
            res.send({successful: false, message: 'bot activities not found'})
        }
    }).catch(()=>{
        res.send({successful: false, message: 'Server error: bot activities not found'})
    })
}

module.exports = getUserBotActivities