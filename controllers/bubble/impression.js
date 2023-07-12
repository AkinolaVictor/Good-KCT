const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes, deleteObject} = require('firebase/storage')
const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const {database} = require('../../database/firebase')
const { dataType } = require('../../utils/utilsExport')

async function impression(req, res){
    const userID = req.body.userID // user.id
    const thisBubble = {...req.body.thisBubble}

    // const docz = doc(database, 'users', thisBubble.user.id)
    const docz = doc(database, 'bubbles', thisBubble.postID)
    await getDoc(docz).then((docsnap)=>{
        if(docsnap.exists()){
            const posts = {...docsnap.data()}
            if(posts.activities.iAmOnTheseFeeds[userID].myActivities.impression){
                // func()
            } else {
                if(posts.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex){
                } else {
                    posts.activities.lastActivityIndex++
                    posts.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex=posts.activities.lastActivityIndex
                }
                posts.activities.iAmOnTheseFeeds[userID].myActivities.impression=true
                const activities = posts.activities
                updateDoc(docz, {activities})
                // func()
            }
        } else {
            res.send({successful: false, message: 'bubble not found'})
        }
    }).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        res.send({successful: false, message: 'Error from the server'})
    })
}

module.exports = impression