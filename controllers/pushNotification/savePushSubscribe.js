// const {doc, getDoc, updateDoc, setDoc, deleteField} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
// const date = require('date-and-time')
// const {database} = require('../../database/firebase')
// const savePush = require('../../models/savePush')
// const webPush = require('web-push')

async function savePushSubscribe(req, res){
    const userID = req.body.userID // user.id
    const subscription = req.body.subscription // user.userInfo.fullname
    const {savePush} = req.dbModels
    
    const userSubscription = await savePush.findOne({userID})
    if(userSubscription === null){
      const newPush = new savePush({userID, subscription})
      await newPush.save()
    } else {
      userSubscription.subscription = subscription
      // await userSubscription.save()
      await savePush.updateOne({userID}, {subscription})
    }
    res.send({successful: true})
}

module.exports = savePushSubscribe