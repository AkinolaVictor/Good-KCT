const {doc, getDoc, updateDoc, setDoc, increment} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes, deleteObject} = require('firebase/storage')
const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const {database} = require('../../database/firebase')
const { dataType } = require('../../utils/utilsExport')

async function openedReply(req, res){
    const userID = req.body.userID // user.id
    const thisBubble = {...req.body.thisBubble}
    // thisBubble.userID = thisBubble.user.id
    // settings, userID
    let secrecySettings = thisBubble.settings.secrecyData
    // console.log(req.body);
    function discernUserIdentity(){
        if(secrecySettings.atmosphere === 'Night (Absolute secrecy)'){
            return true
        } else if(secrecySettings.atmosphere === 'Dark room (Absolute secrecy for reply only)'){
            return true
        } else if(secrecySettings.atmosphere === 'Man behind the scene'){
            return true
        } else if(secrecySettings.atmosphere === 'Just know its me'){
            return true
        } else if(secrecySettings.atmosphere === 'Annonymous' || secrecySettings.atmosphere === 'Anonymous'){
            return false
        } else if(secrecySettings.atmosphere === 'On mask'){
            return true
        } else if(secrecySettings.atmosphere === 'I see you all'){
            return true
        } else if(secrecySettings.atmosphere === 'Day (Absolute openness)'){
            return false
        } else {
            return false
        }
    }

    function updateLastActivity(thisPost, activity, updateFunc){
        function getDate(){
            const now = new Date()
            const time = date.format(now, 'h:mm:ssA')
            const when = date.format(now, 'DD/MM/YYYY')
            const dateString = date.format(now, 'YYYY,MM,DD,HH,mm,ss')
            return {
                time,
                date: when,
                dateString
            }
        }

        if(!thisPost.activities.lastActivities){
            thisPost.activities.lastActivities=[]
        }

        const lastActivities = thisPost.activities.lastActivities
        const activityData = {
            activity,
            userID: userID,
            date: getDate()
        }
        if(lastActivities.length>0){
            const last = lastActivities[lastActivities.length - 1]
            if(last.activity!==activity){
                for(let i=0; i<lastActivities.length; i++){
                    const current = lastActivities[i]
                    if(current.userID===userID && current.activity===activity){
                        break
                    }
                    if(i===lastActivities.length-1){
                        thisPost.activities.lastActivities.push(activityData)
                        if(thisPost.activities.lastActivities.length>10){
                            thisPost.activities.lastActivities.shift()
                        }
                        updateFunc()
                    }
                }
            }
        } else {
            thisPost.activities.lastActivities.push(activityData)
            updateFunc()
        }
    }

    const docz = doc(database, 'bubbles', thisBubble.postID)
    // const docz = doc(database, 'users', thisBubble.user.id)
    await getDoc(docz).then((docu)=>{
        const posts = {...docu.data()}
        if(posts){
            if(posts.activities.iAmOnTheseFeeds[userID].myActivities.openedReply){
            } else {
                if(posts.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex){

                } else {
                    posts.activities.lastActivityIndex++
                    posts.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex=posts.activities.lastActivityIndex
                }
                posts.activities.iAmOnTheseFeeds[userID].seenAndVerified=true
                posts.activities.iAmOnTheseFeeds[userID].myActivities.openedReply=true
                const activities = posts.activities
                updateDoc(docz, {activities})
            }
            
            // update last activities
            const activities = posts.activities
            updateLastActivity(posts, 'opened reply', ()=>{updateDoc(docz, {activities})})
            updateDoc(docz, {openedReplyCount: increment(1)})
        }

    }).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        res.send({successful: false, message: 'Error from the server'})
    })
}

module.exports = openedReply