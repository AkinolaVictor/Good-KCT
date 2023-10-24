const date = require('date-and-time')
const sendPushNotification = require('../pushNotification/sendPushNotification')
// const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const { v4: uuidv4 } = require('uuid')
// const {database} = require('../../database/firebase')
// const { dataType } = require('../../utils/utilsExport')
// const notifications = require('../../models/notifications')
// const bubble = require('../../models/bubble')


// https://www.tutsmake.com/file-upload-in-mongodb-using-node-js/

async function denyShareRequest(req, res){
    const {bubble, notifications} = req.dbModels

    const userID = req.body.userID // user.id
    const data = req.body.data
    
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
    
    async function notifyUser(){
        const userNotification = await notifications.findOne({userID}).lean()
        if(userNotification){
            for(let i=0; i<userNotification.all.length; i++){
                if(userNotification.all[i].id === data.id && userNotification.all[i].type==='shareRequest'){
                    userNotification.all[i].status = 'denied'
                    await notifications.updateOne({userID}, {all: [...userNotification.all]})
                    // await userNotification.save()
                    // break
                    // console.log("i was here");
                    return
                }
            }
        }
    }
    await notifyUser()


    // notify audience
    const newData = {...data}
    newData.message = 'Your request to share this bubble was denied'
    newData.status = 'denied'
    newData.time = getDate()

    async function notifyAudience(){
        const audienceNotification = await notifications.findOne({userID: data.userID}).lean()
        if(audienceNotification === null){
            const newNotif = new notifications({userID: data.userID, all: [newData]})
            await newNotif.save()
        } else {
            audienceNotification.all.push(newData)
            await notifications.updateOne({userID: data.userID}, {all: audienceNotification.all})
            // await audienceNotification.save()
        }
        const thisData = {
            title: `${newData.message}`,
            body: 'please check the notification section in the concealed app to see the bubble, you can also make another share request to the bubble creator.',
            icon: false
        }
        await sendPushNotification(data.userID, thisData, req)
    }
    await notifyAudience()

    async function decreaseCount(){
        const thisBubble = await bubble.findOne({postID: data.feed.postID}).lean()
        if(thisBubble){
            if(typeof(thisBubble.activities) === "string"){
                const activities = JSON.parse(thisBubble.activities)
                thisBubble.activities = activities
            }
            // decrease share request
            if(thisBubble.activities.permissionRequests>0){
                thisBubble.activities.permissionRequests--
                const activities = JSON.stringify(thisBubble.activities)
                await bubble.updateOne({postID: data.feed.postID}, {activities})
            }
        }
    }
    await decreaseCount()

    res.send({successful: true})
}

module.exports = denyShareRequest