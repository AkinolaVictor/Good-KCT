// updateImpression
// const {doc, getDoc, updateDoc, increment} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const bubble = require('../../models/bubble')
const date = require('date-and-time')

async function updateImpression(req, res){
    const {bubble, eachUserAnalytics} = req.dbModels
    
    const userID = req.body.userID // user.id
    const postID = req.body.postID

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

    function getDateGap(previous){
        const prev = [...previous.split(',')]
        prev[1]--
        const previousDay = new Date(...prev)
        let now = new Date()
        return date.subtract(now, previousDay).toDays()
    }

    async function updateUserAnalytics(thisBubble){
        const userAnalytics = await eachUserAnalytics.findOne({userID: thisBubble.user.id}).lean()
        if(userAnalytics === null){
            const data = {
                userID: thisBubble.user.id,
                bubbles: {
                    [userID]: {
                        impressions: 1, replys: 0, likes: 0, shares: 0,
                        bubbleIDs: [thisBubble.postID],
                    }
                }, 
                profile: {
                    [userID]: {
                        follow: 0, 
                        views: 0
                    }
                },
                date: {}
                // date: {...getDate()}
            }
            const newUserAnalytics = new eachUserAnalytics({...data})
            await newUserAnalytics.save()
        } else {
            const {bubbles} = userAnalytics
            if(!bubbles[userID]){
                // console.log("log 1");
                bubbles[userID] = {
                    impressions: 1, replys: 0, likes: 0, shares: 0,
                    bubbleIDs: [thisBubble.postID]
                }
            } else {
                // console.log("log 2");
                bubbles[userID].impressions++
                if(!bubbles[userID].bubbleIDs.includes(thisBubble.postID)){
                    bubbles[userID].bubbleIDs.push(thisBubble.postID)
                }
            }
            await eachUserAnalytics.updateOne({userID: thisBubble.user.id}, {bubbles})
        }
    }

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
            
            await bubble.updateOne({postID}, {activities}).then(async()=>{
                await updateUserAnalytics(thisBubble)
            }).catch(()=>{})
        }

        res.send({successful: true})
    } else {
        res.send({successful: false, message: 'server error: bubble not found'})
    }
}

module.exports = updateImpression