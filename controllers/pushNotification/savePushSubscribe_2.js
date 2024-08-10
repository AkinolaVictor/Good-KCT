// const {doc, getDoc, updateDoc, setDoc, deleteField} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
// const date = require('date-and-time')
// const {database} = require('../../database/firebase')
// const savePush = require('../../models/savePush')
// const webPush = require('web-push')

async function savePushSubscribe_2(req, res){
    const {savePush2} = req.dbModels
    
      const userID = req.body.userID // user.id
      const subscription = req.body.subscription // user.userInfo.fullname
      
      const userSubscription2 = await savePush2.findOne({userID})
      if(userSubscription2 === null){
        const newPush = new savePush2({userID, subscription})
        await newPush.save().then(()=>{console.log("done1");}).catch((e)=>{console.log("failed", e);})
      } else {
        userSubscription2.subscription = subscription
        await savePush2.updateOne({userID}, {subscription}).then(()=>{console.log("done2");}).catch((e)=>{console.log("failed2", e);})
      }
      res.send({successful: true})
  }
  
  module.exports = savePushSubscribe_2