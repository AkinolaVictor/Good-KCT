// const { getDoc, doc } = require("firebase/firestore")
// const { database } = require("../../database/firebase")
// const notifications = require("../../models/notifications")
// const date = require('date-and-time')

async function getUserNotification(req, res){
    const {notifications} = req.dbModels
    const userID = req.body.userID
    
    const notif = await notifications.findOne({userID}).lean()
    // const now = new Date()
    // const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')

    if(notif){
        for(let j=0; j<notif.all.length; j++){
            notif.all[j].hide = false
        }
        res.send({successful: true, notifications: [...notif.all]})
    } else {
        res.send({successful: true, notifications: []})
    }
}

module.exports = getUserNotification