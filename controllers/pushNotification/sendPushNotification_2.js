const webPush = require('web-push');
const expoSDK = require('./expoSDK');

async function sendPushNotification_2({userIDs, data, req}){
    const {savePush2} = req.dbModels

    if(!userIDs){
        return
    }
    
    // const payload2 = JSON.stringify({
    //     title: 'Concealed',
    //     serverDefault: {
    //         actions: [
    //             { action: 'open_concealed', title: 'Open Concealed'},
    //         ],
    //         vibrate: [200, 100, 200],
    //         click_action: 'https://concealed.vercel.app'
    //     },
    //     subData: { concealed_url: 'https://concealed.vercel.app' },
    //     ...data
    // })

    // const expoPushToken = await savePush2.findOne({userIDs})
    // console.log({userIDs});
    const somePushTokens = []
    const acquiredPushTokens = await savePush2.find({userID: {$in: [...userIDs]}}).lean()
    for(let i=0; i<acquiredPushTokens.length; i++){
        const token = acquiredPushTokens[i]?.subscription
        token && somePushTokens.push(token)
    }
    // if(expoPushToken){
        const payload = {
            // to: expoPushToken,
            // sound: 'default',
            title: 'Original Title',
            body: 'some notifications!',
            // data: { someData: 'goes here' },
            ...data
        };
        // console.log({payload2:payload});
        // console.log({data});
        // console.log({payload});
        
        // if(payload.image){
        //     payload.attachments = [
        //         {
        //             identifier: 'image',
        //             url: payload.image,
        //             type: 'image/png'
        //         }
        //     ]
        // }

        
        // await fetch('https://exp.host/--/api/v2/push/send', {
        //     method: 'POST',
        //     headers: {
        //     Accept: 'application/json',
        //     'Accept-encoding': 'gzip, deflate',
        //     'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(payload),
        // });
        await expoSDK({somePushTokens, payload})
    // }
            
}
        
module.exports = sendPushNotification_2