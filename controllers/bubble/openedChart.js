const date = require('date-and-time')
// const {doc, getDoc, updateDoc, setDoc, increment} = require('firebase/firestore')
// const { v4: uuidv4 } = require('uuid')
// const {database} = require('../../database/firebase')
// const { dataType } = require('../../utils/utilsExport')
// const bubble = require('../../models/bubble')

async function openedChart(req, res){
    try{
        const {bubble} = req.dbModels
        const userID = req.body.userID // user.id
        const currentBubble = {...req.body.thisBubble}
        // thisBubble.userID = thisBubble.user.id
        // settings, userID
        // console.log(currentBubble.postID);

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

        const thisBubble = await bubble.findOne({postID: currentBubble.postID}).lean()
        if(thisBubble){
            if(typeof(thisBubble.activities) === "string"){
                const activities = JSON.parse(thisBubble.activities)
                thisBubble.activities = activities
            }
            
            if(!thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.openedChart){
                if(thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex){
                    
                } else {
                    thisBubble.activities.lastActivityIndex++
                    thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex = thisBubble.activities.lastActivityIndex
                }
                thisBubble.activities.iAmOnTheseFeeds[userID].seenAndVerified=true
                thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.openedChart=true
            } 

            // Start update last activity
            if(!thisBubble.activities.lastActivities){
                thisBubble.activities.lastActivities=[]
            }
            const activity = "opened chart"
            const lastActivities = thisBubble.activities.lastActivities
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
                            thisBubble.activities.lastActivities.push(activityData)
                            if(thisBubble.activities.lastActivities.length>10){
                                thisBubble.activities.lastActivities.shift()
                            }
                        }
                    }
                }
            } else {
                thisBubble.activities.lastActivities.push(activityData)
            }
    
            const activities = JSON.stringify(thisBubble.activities)
            const openedChartCount = thisBubble.openedChartCount + 1
            await bubble.updateOne({postID: currentBubble.postID}, {openedChartCount, activities}).then(()=>{
                res.send({successful: true})
            }).catch((e)=>{
                console.log("null")
                console.log(e)
                res.send({successful: false, message: 'unable to update activities'})
            })
        } else {
            console.log("null")
            res.send({successful: false, message: 'bubble not found or server error'})
        }
        
    } catch (e){
        console.log("failed");
        console.log(e);
        res.send({successful: false, message: 'failed to update'})
    }
}

module.exports = openedChart