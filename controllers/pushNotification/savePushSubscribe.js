const {doc, getDoc, updateDoc, setDoc, deleteField} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
const {database} = require('../../database/firebase')
const webPush = require('web-push')

async function savePushSubscribe(req, res){
    const userID = req.body.userID // user.id
    const subscription = req.body.subscription // user.userInfo.fullname
    const newUserID = req.body.newUserID // props.data.id

    
    const subscriptionRef = doc(database, 'savePushSubscriptions', userID)
    
    await setDoc(bubbleRef, {subscription}).then(async(result)=>{
      res.send({successful: true})
    })
    
}

module.exports = savePushSubscribe