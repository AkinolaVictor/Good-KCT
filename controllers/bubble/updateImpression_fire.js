// updateImpression
const {doc, getDoc, updateDoc, increment} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function updateImpression(req, res){
    const userID = req.body.userID // user.id
    const postID = req.body.postID
    // const thisBubble = {...req.body.thisBubble}


    const bubbleRef = doc(database, 'bubbles', postID)
    await getDoc(bubbleRef).then(async(docsnap)=>{
        if(docsnap.exists()){
            const posts = {...docsnap.data()}
            // count my impressions
            if(posts.activities.iAmOnTheseFeeds[userID].myImpressions){
                posts.activities.iAmOnTheseFeeds[userID].myImpressions++
            } else {
                posts.activities.iAmOnTheseFeeds[userID].myImpressions = 1
            }

            if(!posts.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex){
                posts.activities.lastActivityIndex++
                posts.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex=posts.activities.lastActivityIndex
            }

            posts.activities.iAmOnTheseFeeds[userID].myActivities.impression=true

            const activities = posts.activities
            await updateDoc(bubbleRef, {totalImpressions:increment(1), activities})
        }
    }).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        res.send({successful: false, message: 'Error from the server'})
    })
}

module.exports = updateImpression