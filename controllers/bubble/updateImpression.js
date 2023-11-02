// updateImpression
// const {doc, getDoc, updateDoc, increment} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const bubble = require('../../models/bubble')

async function updateImpression(req, res){
    const {bubble} = req.dbModels
    
    const userID = req.body.userID // user.id
    const postID = req.body.postID

    const thisBubble = await bubble.findOne({postID}).lean()
    if(thisBubble){
        if(typeof(thisBubble.activities) === "string"){
            const activities = JSON.parse(thisBubble.activities)
            thisBubble.activities = activities
        }

        if(!thisBubble.activities.iAmOnTheseFeeds){
            const activities = JSON.parse(thisBubble.activities)
            thisBubble.activities = activities
        }

        if(!thisBubble.activities.iAmOnTheseFeeds){
            const activities = JSON.parse(thisBubble.activities)
            thisBubble.activities = activities
        }

        if(!thisBubble.activities.iAmOnTheseFeeds){
            res.send({successful: false, message: 'server error: bubble doc invalid'})
            return
        }


        if(thisBubble.activities.iAmOnTheseFeeds[userID]){
            if(thisBubble.activities.iAmOnTheseFeeds[userID].myImpressions){
                thisBubble.activities.iAmOnTheseFeeds[userID].myImpressions++
            } else {
                thisBubble.activities.iAmOnTheseFeeds[userID].myImpressions = 1
            }
    
            if(!thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex){
                thisBubble.activities.lastActivityIndex++
                thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex = thisBubble.activities.lastActivityIndex
            }
    
            thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.impression = true
            const activities = JSON.stringify(thisBubble.activities)
            // const totalImpressions = thisBubble.totalImpressions+1
            await bubble.updateOne({postID}, {activities})
        }

        res.send({successful: true})
    } else {
        res.send({successful: false, message: 'server error: bubble not found'})
    }
}

module.exports = updateImpression