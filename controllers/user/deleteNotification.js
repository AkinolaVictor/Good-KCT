const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function deleteNotification(req, res){
    let userID = req.body.userID
    let notificationID = req.body.notificationID

    try{
        const notificationRef = doc(database, 'notifications', userID)
        
        await getDoc(notificationRef).then(async(snapshot)=>{
            const all = [...snapshot.data().all]
            for(let i=0; i<all.length; i++){
                if(all[i].id === notificationID){
                    all.splice(i, 1)
                    await updateDoc(notificationRef, {all}).then(()=>{
                        res.send({successful: true})
                    })
                    break
                }
            }
        }).catch(()=>{
            res.send({successful: false, message: 'Server error: unable to delete notification'})
        })
    } catch(e){
        res.send({successful: false, message: 'Server error: failed to delete notification'})
    }
}

module.exports = deleteNotification