const webPush = require('web-push')

async function sendPushNotification_2(userID, data, req){
    const {savePush2} = req.dbModels

    if(!userID){
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

    const expoPushToken = await savePush2.findOne({userID})
    if(expoPushToken){
        const payload = {
            to: expoPushToken,
            sound: 'default',
            title: 'Original Title',
    
            body: 'And here is the body!',
            data: { someData: 'goes here' },
            ...data
        };
        
        
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
    }
            
}
        
module.exports = sendPushNotification_2