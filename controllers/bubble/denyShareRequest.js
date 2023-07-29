const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes, deleteObject} = require('firebase/storage')
const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const {database} = require('../../database/firebase')
const { dataType } = require('../../utils/utilsExport')
const sendPushNotification = require('../pushNotification/sendPushNotification')

async function denyShareRequest(req, res){
    const userID = req.body.userID // user.id
    const data = req.body.data
    
    // function decideNotifyIcon(){
    //     if(discernUserIdentity() || userIcon === false){
    //         return false
    //     } else {
    //         return userIcon
    //     }
    // }
    
    function getDate(){
        const now = new Date()
        const time = date.format(now, 'h:mmA')
        const when = date.format(now, 'DD/MM/YYYY')
        const dateString = date.format(now, 'YYYY,MM,DD,HH,mm,ss')
        
        return {
            time,
            date: when,
            dateString
        }
    }
    
    const creatorNotificationsRef = doc(database, 'notifications', userID)
    await getDoc(creatorNotificationsRef).then(async(snapshot)=>{
        if(snapshot.exists()){
            // update all
            const all=[...snapshot.data().all]
            for(let i=0; i<all.length; i++){
                if(all[i].id === data.id && all[i].type==='shareRequest'){
                    all[i].status = 'denied'
                    await updateDoc(creatorNotificationsRef, {all})
                    break
                }
            }
            // updateDoc(creatorNotificationsRef, {all})
        }
    })


    // notify audience
    const newData = {...data}
    newData.message = 'Your request to share this bubble was denied'
    newData.status = 'denied'
    newData.time = getDate()
    
    const audienceNotificationsRef = doc(database, 'notifications', data.userID)
    await getDoc(audienceNotificationsRef).then(async(snapshot)=>{
        if(!snapshot.exists()){
            setDoc(audienceNotificationsRef, {
                all: [newData]
            })
        } else {
            const all=[...snapshot.data().all]
            all.push(newData)
            await updateDoc(audienceNotificationsRef, {all})
        }
    }).then(()=>{
        const data = {
            title: `${newData.message}`,
            body: 'please check the notification section in the app to see the bubble, you can also make another share request to the bubble creator.',
            icon: false
        }
        sendPushNotification(data.userID, data)
    })

    const bubbleRef = doc(database, 'bubbles', data.feed.postID)
    await getDoc(bubbleRef).then(async(docsnap)=>{
        if(docsnap.exists()){
            const posts = {...docsnap.data()}
            // decrease share request
            if(posts.activities.permissionRequests>0){
                posts.activities.permissionRequests--
                const activities = posts.activities
                await updateDoc(bubbleRef, {activities})
            }
        }
    })

    res.send({successful: true})
}

module.exports = denyShareRequest