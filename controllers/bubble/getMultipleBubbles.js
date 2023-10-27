const { dataType } = require("../../utils/utilsExport")
const date = require('date-and-time')

async function getMultipleBubbles(req, res){
    const {User, Feeds, bot, Followers, bubble} = req.dbModels
    
    const userID = req.body.userID
    const allBubbles =  req.body.bubbles
    
    if(!allBubbles.length){
        res.send({successful: false, message: 'Empty bubbles'})
        return 
    }
    
    function checkForSecrecy(thisBubble){
        const secrecySettings = thisBubble.settings.secrecyData.atmosphere
        if(secrecySettings==='On mask'){
            return true 
        } else if (secrecySettings === 'Anonymous'){
            return true
        } else if (secrecySettings === 'Man behind the scene'){
            return true
        } else if (secrecySettings === 'Just know its me'){
            return true
        } else if(secrecySettings.atmosphere === 'Normal'){
            return secrecySettings.identity=='No'?false:true
        } else if (secrecySettings.atmosphere === 'Custom'){
            if(secrecySettings.custom.bubble==="Nobody"){
                return true
            } else if(secrecySettings.custom.bubble==="Everyone"){
                return false
            } else if(secrecySettings.custom.bubble==="I want to handpick"){
                const bubbleIDs = secrecySettings.custom.bubbleIDs
                if(bubbleIDs[userID]){
                    return false
                } else {
                    return true
                }
            } else if(secrecySettings.custom.bubble==="I want to handpick exceptions"){
                const bubbleIDs = secrecySettings.custom.bubbleIDs
                if(bubbleIDs[userID]){
                    return true
                } else {
                    return false
                }
            } else {
                return true
            }
        } else if (secrecySettings === 'Night'){
            return true
        } else {
            return false
        }
    }

    function ifForAudience(thisBubble){
        const bubble = thisBubble.bubble
        let allAudience = []
        for(let i=0; i<bubble.length; i++){
            const audienceData = {...bubble[i].audienceData}
            const aud = [...Object.keys(audienceData)]
            for(let j=0; j<aud.length; j++){
                const curr = aud[j]
                if(!allAudience.includes(curr)){
                    allAudience.push(curr)
                }
            }
        }

        const audienceNames = []
        for(let i=0; i<bubble.length; i++){
            audienceNames.push(bubble[i].name)
        }

        if(audienceNames.includes('Everyone')){
            return false
        } else if(audienceNames.includes('My Followers')){
            if(thisBubble.followers[userID]){
                return false
            } else {
                return true
            }
        } else {
            if(allAudience.includes(userID)){
                return false
            } else {
                return true
            }
        }
    }

    function viewEligibity(thisBubble){
        // CHECK IF USER IS ELIGIBLE TO SEE THIS BUBBLE
        let feedRef = null
        for(let i=0; i<allBubbles.length; i++){
            if(allBubbles[i].postID === thisBubble.postID){
                feedRef = allBubbles[i]
            }
        }
        if(feedRef){
            if((checkForSecrecy(thisBubble) || ifForAudience(thisBubble)) && feedRef.userID!==userID && feedRef.env==='profile'){
                return false
            } else if(ifForAudience(thisBubble) && feedRef.userID!==userID){
                return false
            } else {
                return true
            }
        } else {
            return false
        }
    }
    
    try {
        let postIDs = []
        let creatorIDs = []
    
        for(let i=0; i<allBubbles.length; i++){
            if(!postIDs.includes(allBubbles[i].postID)){
                postIDs.push(allBubbles[i].postID)
            }
    
            if(!creatorIDs.includes(allBubbles[i].userID)){
                creatorIDs.push(allBubbles[i].userID)
            }
        }








    
        // const acquiredBubbles = {}
        const multipleBubbles = await bubble.find({postID: {$in: [...postIDs]}}).lean()
        if(!multipleBubbles.length){
            res.send({successful:false, message: 'Bubble not found'})
            return
        } else {
            for(let i=0; i<multipleBubbles.length; i++){
                let currentBubble = {...multipleBubbles[i]}
        
                if(typeof(currentBubble.reply) === "string"){
                    const reply = JSON.parse(currentBubble.reply)
                    currentBubble.reply = reply
                }
                  
                if(typeof(currentBubble.shareStructure) === "string"){
                    const shareStructure = JSON.parse(currentBubble.shareStructure)
                    currentBubble.shareStructure = shareStructure
                }
        
                if(typeof(currentBubble.activities) === "string"){
                    const activities = JSON.parse(currentBubble.activities)
                    currentBubble.activities = activities
                }


                if(!currentBubble.activities.iAmOnTheseFeeds){
                    multipleBubbles.splice(i, 1)
                    continue
                }
            
                // IF THIS USER HAS NOT SEEN THIS BUBBLE BEFORE, UPDATE BUBBLE
                if(currentBubble.activities.iAmOnTheseFeeds[userID]){
                    // if user hasn't mounted on a screen
                    if(!(currentBubble.activities.iAmOnTheseFeeds[userID].mountedOnDevice)){
                        currentBubble.activities.iAmOnTheseFeeds[userID].mountedOnDevice=true
                        const activities = JSON.stringify(currentBubble.activities)
                        await bubble.updateOne({postID: currentBubble.postID}, {activities})
                    }
                }
                multipleBubbles[i] = currentBubble
                currentBubble = null
            }
        








            const acquiredUsers = {}
            const bubbleCreators = await User.find({id: {$in: [...creatorIDs]}}).lean()
            if(!bubbleCreators.length){
                res.send({successful:false, message: 'Bubble creators not found'})
                return
            } else {
                for(i=0; i<bubbleCreators.length; i++){
                    acquiredUsers[bubbleCreators[i].id] = bubbleCreators[i]
                }
            }
            
            // for(let i=0; i<multipleBubbles.length; i++){
            //     let currentBubble = {...multipleBubbles[i]}
            //     const creator = currentBubble.user.id
            //     if(!acquiredUsers[creator]){
            //         multipleBubbles.splice(i, 1)
            //         continue
            //     } else {
            //         currentBubble.profilePhoto = acquiredUsers[creator].profilePhotoUrl
            //         currentBubble.username = acquiredUsers[creator].userInfo.username
            //         currentBubble.fullname = acquiredUsers[creator].userInfo.fullname
            //     }
            //     multipleBubbles[i] = currentBubble
            //     currentBubble = null
            // }











            const acquiredFollowers = {}
            const creatorFollowers = await Followers.find({userID: {$in: [...creatorIDs]}}).lean()
            if(!creatorFollowers.length){
                for(i=0; i<creatorFollowers.length; i++){
                    acquiredFollowers[creatorFollowers[i].userID] = {...creatorFollowers[i].followers}
                }
            }








            for(let i=0; i<multipleBubbles.length; i++){
                // CHECK FOR ELIGIBITY
                let currentBubble = {...multipleBubbles[i]}
                const creator = currentBubble.user.id
                let feedRef = null
                if(!viewEligibity(currentBubble)){
                    multipleBubbles.splice(i, 1)
                    currentBubble = null
                    continue
                } else {
                    // prepare Data to be finally sent out (dont forget bot in client side)
                    for(let i=0; i<allBubbles.length; i++){
                        if(allBubbles[i].postID === currentBubble.postID){
                            feedRef = allBubbles[i]
                        }
                    }

                    if(feedRef) {
                        currentBubble = {
                            ...currentBubble,
                            ...feedRef.data,
                            refDoc: feedRef,
                            env: feedRef.env
                        }
                    } else {
                        multipleBubbles.splice(i, 1)
                        currentBubble = null
                        continue
                    }
                }
                
                if(acquiredFollowers[creator]){
                    currentBubble.followers = {...acquiredFollowers[creator]}
                    currentBubble.followersReady=true
                } else {
                    currentBubble.followers = {}
                    currentBubble.followersReady=true
                }



                if(!acquiredUsers[creator]){
                    multipleBubbles.splice(i, 1)
                    currentBubble = null
                    continue
                } else {
                    currentBubble.profilePhoto = acquiredUsers[creator].profilePhotoUrl
                    currentBubble.username = acquiredUsers[creator].userInfo.username
                    currentBubble.fullname = acquiredUsers[creator].userInfo.fullname
                }

                if(currentBubble === null){
                    continue
                }

                // GET BOTS IF BUBBLE HAS BOTS
                const bubbleSetting = currentBubble.settings
                const bots = [...Object.keys(bubbleSetting.botData)]
                if(bots.length){
                    for(let k=0; k<bots.length; k++){
                        const id = bots[k]
                        const bubbleBot = await bot.findOne({id}).lean()
                        if(!bubbleBot){
                            if(currentBubble.settings.botData[id]){
                                delete currentBubble.settings.botData[id]
                            }
                        } else {
                            if(currentBubble.settings.botData[id]){
                                currentBubble.settings.botData[id] = {...currentBubble.settings.botData[id], ...bubbleBot}
                            }
                        }
                    }
                }
                
                if(!currentBubble.activities.iAmOnTheseFeeds){
                    multipleBubbles.splice(i, 1)
                    continue
                }

                // REGISTER USER TO BUBBLE ACTIVITIES IF ABSENT
                if(!currentBubble.activities.iAmOnTheseFeeds[userID]){
                    let sameBubble = await bubble.findOne({postID: currentBubble.postID}).lean()
                    if(sameBubble){
                        if(typeof(sameBubble.activities) === "string"){
                            const activities = JSON.parse(sameBubble.activities)
                            sameBubble.activities = activities
                        }
        
                        if(!sameBubble.activities.iAmOnTheseFeeds[userID]){
                            sameBubble.activities.iAmOnTheseFeeds[userID] = {
                                index: Object.keys(sameBubble.activities.iAmOnTheseFeeds).length,
                                onFeed: true, 
                                mountedOnDevice: true,
                                userID: userID,
                                myImpressions: 0,
                                seenAndVerified: false,
                                replyPath: [],
                                myActivities: {
                                    impression: true
                                }
                            }
                            
                            currentBubble.activities = sameBubble.activities
                            const activities = JSON.stringify(sameBubble.activities)
                            await bubble.updateOne({postID: currentBubble.postID}, {activities})
        
        
                            // give feedRef to user---to be on a safe zone, i have to initialize as deleted...
                            const userFeed = await Feeds.findOne({userID})
                            if(userFeed){
                            // if(!userFeed){
                            //     const newUserFeed = new Feeds({userID, bubbles: [feedRef]})
                            //     await newUserFeed.save()
                            // } else {
                                let access = true
                                if(userFeed.bubbles){
                                    for(let i=0; i<userFeed.bubbles.length; i++){
                                        if(dataType(userFeed.bubbles[i])==='object'){
                                            if(userFeed.bubbles[i].postID === currentBubble.postID){
                                                access=false
                                                break
                                            }
                                        }
                                    }
                                    
                                    if(access){
                                        userFeed.bubbles.push(feedRef)
                                        await Feeds.updateOne({userID}, {bubbles: [...userFeed.bubbles]})
                                    }
                                }
                            }
                        }
        
                    }
        
                }

                const now = new Date()
                const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')
                currentBubble.formattedDate = formattedDate
                multipleBubbles[i] = currentBubble
            }
            
            res.send({successful: true, bubbles: multipleBubbles})
        }
    
    
    
    } catch(e){
        console.log("failed to get bubble", e);
        res.send({successful:false, message: 'Server error occured'})
    }
}
module.exports = getMultipleBubbles