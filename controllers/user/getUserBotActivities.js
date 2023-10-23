const {doc, getDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')
const botActivities = require('../../models/BotActivities')

async function getUserBotActivities(req, res){
    let userID = req.body.userID
    
    const userBotActivities = await botActivities.findOne({userID}).lean()
    if(userBotActivities === null){
        res.send({successful: false, message: 'Server error: bot activities not found'})
    } else {
        res.send({successful: true, botActivities: {
            otherBotActivities: [...userBotActivities.otherBotActivities],
            userBotActivities: [...userBotActivities.userBotActivities]
        }})
    }
}

module.exports = getUserBotActivities