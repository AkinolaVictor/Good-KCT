const webPush = require('web-push')
// const {doc, getDoc, updateDoc, setDoc, deleteField} = require('firebase/firestore')
// const date = require('date-and-time')
// const {database} = require('../../database/firebase')
// const savePush = require('../../models/savePush')

async function sendPushNotification(userID, data, req){
    const {savePush} = req.dbModels
    // const userID = req.body.userID / user.id
    // const data = req.body.data // user.userInfo.fullname
    // const newUserID = req.body.newUserID // props.data.id
    // console.log('worked here 1');

    if(!userID){
        return
    }
    // console.log('i ran');
    
    const vapidKey = {
        publicKey: process.env.CONCEALED_PUSH_VAPID_PUBLIC_KEY,
        privateKey: process.env.CONCEALED_PUSH_VAPID_PRIVATE_KEY
    }
    
    webPush.setVapidDetails("mailto:test@gmail.com", vapidKey.publicKey, vapidKey.privateKey)
    // webPush.setVapidDetails("mailto:concealed.bubble@gmail.com", vapidKey.publicKey, vapidKey.privateKey)
    
    const payload = JSON.stringify({
        title: 'Concealed',
        // body: 'This is a push Notification from concealed server',
        // badge: 'https://firebasestorage.googleapis.com/v0/b/concealed-f8f32.appspot.com/o/systemFolder%2Ficons%2FconcealedLogo_64_solid.png?alt=media&token=e7c5f409-335c-4e8e-8258-cdbc154f6d15',
        serverDefault: {
            actions: [
                { action: 'open_concealed', title: 'Open Concealed'},
                // { action: 'close',title: 'Close', icon: '/concealedLogo_192_solid.png', click_action: "https://concealed.vercel.app"}
            ],
            vibrate: [200, 100, 200],
            click_action: 'https://concealed.vercel.app'
        },
        subData: { concealed_url: 'https://concealed.vercel.app' },
        ...data
    })
    const userSub = await savePush.findOne({userID})
    if(userSub === null){
        // res.send({successful: 'fail'})
    } else {
        const subscription = JSON.parse(userSub.subscription)
        webPush.sendNotification(subscription, payload).then((res)=>{
        }).catch(()=>{
        })
    }
            
}
        
module.exports = sendPushNotification