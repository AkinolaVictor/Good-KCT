// updateImpression
// const {doc, getDoc, updateDoc, increment} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const bubble = require('../../models/bubble')
const date = require('date-and-time')
const registerViewedHashs = require('../../utils/registerViewedHash')
const knowledgeBuilder = require('../../utils/knowledgeBuilder')
const knowledgeTypes = require('../../utils/knowledgeTypes')
const updateBubbleRank = require('../../utils/updateBubbleRank')
const dataType = require('../../utils/dataType')
const checkBubbleLikes = require('../../utils/checkBubbleLikes')
const checkBubbleShares = require('../../utils/checkBubbleShares')
const checkBubbleReplys = require('../../utils/checkBubbleReplys')
const buildRetainedAudience = require('../../utils/buildRetainedAudience')

async function updateImpression(req, res){
    const models = req.dbModels
    const {bubble, eachUserAnalytics, reservedContents} = models
    
    const userID = req.body.userID // user.id
    const postID = req.body.postID

    const monthMap = {Jan: "00", Feb: "01", Mar: "02", Apr: "03", May: "04", Jun: "05", Jul: "06", Aug: "07", Sep: "08", Oct: "09", Nov: "10", Dec: "11"}

    // knowledgeBuilder({})
    async function updateUserAnalytics(thisBubble){
        // update bubble creator analytics
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

    function convertDayToString(day){
        const actualDate = day.split(", ")[1].split(" ")
        const actualTime = day.split(", ")[1].split(" ")[3].split(":")
        const dayString = `${actualDate[2]},${monthMap[actualDate[1]]},${actualDate[0]},${actualTime[0]},${actualTime[1]},${actualTime[2]}`  //YYYY,MM,DD,HH,mm,ss 
        return dayString
    }

    // const users = await User.find({}).lean()
    // if(users){
    //     for(let i=0; i<users.length; i++){
    //     // for(let i=0; i<2; i++){
    //         const curr = users[i]
    //         const dateJoined = curr.userInfo.dateJoined
    //         const string = convertDayToString(dateJoined)
    //         const gap = getDateGap(string)
    //         console.log(gap);
    //     }
    // }

    const thisBubble = await bubble.findOne({postID}).lean()
    if(thisBubble){
        const feedRef = thisBubble.feedRef?thisBubble.feedRef:null
        let hashList = []
        if(feedRef){
            const {metaData} = feedRef
            if(metaData){
                const hashs = metaData.hash||{}
                hashList = [...Object.keys(hashs)]
            }
        }
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
                await registerViewedHashs(eachUserAnalytics, thisBubble, userID)
                thisBubble.activities.iAmOnTheseFeeds[userID].myImpressions = 1
            }
    
            if(!thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex){
                thisBubble.activities.lastActivityIndex++
                thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.activityIndex = thisBubble.activities.lastActivityIndex
            }
    
            thisBubble.activities.iAmOnTheseFeeds[userID].myActivities.impression = true
            const activities = JSON.stringify(thisBubble.activities)

            const reserved = await reservedContents.findOne({userID}).lean()
            if(reserved){
                const bubbles = reserved.bubbles||[]
                for(let i=0; i<bubbles.length; i++){
                    const curr = bubbles[i]
                    if(dataType(curr)!=="object") continue
                    const contentID = curr.postID
                    if(postID === contentID){
                        bubbles.splice(i, 1)
                    }
                }
                await reservedContents.updateOne({userID}, {bubbles})
            }
            
            await bubble.updateOne({postID}, {activities}).then(async()=>{
                await updateUserAnalytics(thisBubble)
                if(feedRef){
                    const {metaData} = feedRef
                    if(metaData){
                        const hash = metaData.hash||{}

                        await updateBubbleRank({which: "impressions",  models: req.dbModels, feedRef})
                        await knowledgeBuilder({userID, models, which: knowledgeTypes.impression, intent: "hashtags", hash: [...Object.keys(hash)]})
                        
                        try {
                            const checkLikes = checkBubbleLikes({thisBubble, userID})
                            const checkShares = checkBubbleShares({thisBubble, userID})
                            const checkReplys = checkBubbleReplys({thisBubble, userID})
                            
                            const checkForRetain = checkLikes || checkShares || checkReplys
                            if(!checkForRetain){
                                await buildRetainedAudience({userID, models: req.dbModels, which: "impression", feedRef, type: "bubble"})
                            }
                        } catch(e){
                            console.log(e);
                            console.log("retained audience in bubble impression");
                        }
                    }
                }
            }).catch(()=>{})
        }

        res.send({successful: true})

    } else {
        res.send({successful: false, message: 'server error: bubble not found'})
    }
}

module.exports = updateImpression