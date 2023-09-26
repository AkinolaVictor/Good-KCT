const { getDoc, doc } = require("firebase/firestore")
const { database } = require("../../database/firebase")

async function getUserNotification(req, res){
    const userID = req.body.userID
    // console.log(userID);
    const notificationRef = doc(database, 'notifications', userID)
    // console.log('called');
    await getDoc(notificationRef).then((docsnap)=>{
        if(docsnap.exists()){
            // console.log('called2');
            const data = [...docsnap.data().all]
            for(let j=0; j<data.length; j++){
                data[j].hide = false
            }
            res.send({successful: true, notifications: [...data]})
        } else {
            res.send({successful: true, notifications: []})
        }
    }).catch(()=>{
        res.send({successful: false, message: "Unable to fetch notifications, please try again"})
    })
}


module.exports = getUserNotification