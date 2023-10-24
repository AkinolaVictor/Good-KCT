// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const notifications = require('../../models/notifications')

async function deleteNotification(req, res){
    const {notifications} = req.dbModels
    
    let userID = req.body.userID
    let notificationID = req.body.notificationID

    try{
        const userNotif = await notifications.findOne({userID})
        if(userNotif === null){
            res.send({successful: false, message: "user data not found"})
        } else {
            for(let i=0; i<userNotif.all.length; i++){
                if(userNotif.all[i].id === notificationID){
                    userNotif.all.splice(i, 1)
                    await notifications.updateOne({userID}, {all: [...userNotif.all]}).then(()=>{
                    // await userNotif.save().then(()=>{
                        res.send({successful: true})
                    }).catch(()=>{
                        res.send({successful: false, message: "Notification not deleted"})
                    })
                    break
                }
            }
            
        }
    } catch(e){
        res.send({successful: false, message: 'Server error: failed to delete notification'})
    }
}

module.exports = deleteNotification