const {doc, getDoc, updateDoc, setDoc, deleteField} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
const {database} = require('../../database/firebase')
const webPush = require('web-push')

async function sendPushNotification(userID, data){
    // const userID = req.body.userID / user.id
    // const data = req.body.data // user.userInfo.fullname
    // const newUserID = req.body.newUserID // props.data.id
    // console.log('worked here 1');
    
    const vapidKey = {
        publicKey: process.env.CONCEALED_PUSH_VAPID_PUBLIC_KEY,
        privateKey: process.env.CONCEALED_PUSH_VAPID_PRIVATE_KEY
    }
    
    webPush.setVapidDetails("mailto:test@gmail.com", vapidKey.publicKey, vapidKey.privateKey)
    // webPush.setVapidDetails("mailto:concealed.bubble@gmail.com", vapidKey.publicKey, vapidKey.privateKey)
    
    const payload = JSON.stringify({
        title: 'Concealed',
        // body: 'This is a push Notification from concealed server',
        ...data
    })
    const userSubscriptionRef = doc(database, 'savedPushSubscriptions', userID)
    await getDoc(userSubscriptionRef).then((docsnap)=>{
        if(docsnap.exists()){
            const subscription = JSON.parse(docsnap.data().subscription)
            // console.log(subscription);
            webPush.sendNotification(subscription, payload).then((res)=>{
                // console.log(res);
            })
    // webPush.sendNotification(subscription, data).then(()=>{
        //     res.send({successful: true})
        // }).catch(()=>{
            //     res.send({successful: false, message: 'failed to send push notification'})
            // })
        }
    })
            
}
        
        module.exports = sendPushNotification