const date = require('date-and-time')
// const { dataType } = require('../../utils/utilsExport')
// const {database} = require('../../database/firebase')
// const bubble = require('../../models/bubble')
// const {doc, getDoc, updateDoc, setDoc, increment} = require('firebase/firestore')
// const { v4: uuidv4 } = require('uuid')

async function openedReply(req, res){
    const {bubble} = req.dbModels

    const userID = req.body.userID // user.id
    const thisBubble = {...req.body.thisBubble}
    // thisBubble.userID = thisBubble.user.id
    // settings, userID

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
    function updateLastActivity(thisPost, activity, updateFunc){

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

    // const docz = doc(database, 'bubbles', thisBubble.postID)
    // const docz = doc(database, 'users', thisBubble.user.id)
    try {
        const currentBubble = await bubble.findOne({postID: thisBubble.postID}).lean()
        if(currentBubble === null){
            res.send({successful: false, messahe: "Bubble not found"})
        } else {
            if(typeof(currentBubble.activities) === "string"){
                const activities = JSON.parse(currentBubble.activities)
                currentBubble.activities = activities
            }

            if(!currentBubble.activities.iAmOnTheseFeeds[userID].myActivities.openedReply){
                if(currentBubble.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex){

                } else {
                    currentBubble.activities.lastActivityIndex++
                    currentBubble.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex=currentBubble.activities.lastActivityIndex
                }
                currentBubble.activities.iAmOnTheseFeeds[userID].seenAndVerified=true
                currentBubble.activities.iAmOnTheseFeeds[userID].myActivities.openedReply=true
            }

            const activity = 'opened reply'

            if(!currentBubble.activities.lastActivities){
                currentBubble.activities.lastActivities=[]
            }
    
            const lastActivities = currentBubble.activities.lastActivities
            const activityData = {
                activity,
                userID,
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
                            currentBubble.activities.lastActivities.push(activityData)
                            if(currentBubble.activities.lastActivities.length>10){
                                currentBubble.activities.lastActivities.shift()
                            }
                        }
                    }
                }
            } else {
                currentBubble.activities.lastActivities.push(activityData)
            }

            const activities = JSON.stringify(currentBubble.activities)
            const openedReplyCount = currentBubble.openedReplyCount + 1
            await updateOne({postID: thisBubble.postID}, {activities, openedReplyCount})
            res.send({successful: true})
        }
    } catch(e){
        res.send({successful: false, message: 'Error from the server'})
    }
}

module.exports = openedReply