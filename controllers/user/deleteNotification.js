// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const notifications = require('../../models/notifications')

async function deleteNotification(req, res){
    const {notifications} = req.dbModels
    
    let userID = req.body.userID
    let notificationID = req.body.notificationID
    let notificationData = req.body.notification
    const {id, time, when} = notificationData
    // let notificationID = id
    const notTime = time?.time
    const notDate = time?.date
    // const notificationTime = time

    try{
        const userNotif = await notifications.findOne({userID})
        if(userNotif === null){
            res.send({successful: false, message: "user data not found"})
        } else {
            for(let i=0; i<userNotif.all.length; i++){
                const thisDate = userNotif.all[i]?.date
                const thisTime = userNotif.all[i]?.time

                const ifDate = thisDate===notDate
                const ifTime = thisTime===notTime
                
                const timeChecker = ifDate && ifTime
                const idChecker = userNotif.all[i].id === notificationID

                if(idChecker || timeChecker){
                    userNotif.all.splice(i, 1)
                    console.log("found");
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