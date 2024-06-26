const date = require('date-and-time')
const { dataType } = require('../../utils/utilsExport')

async function getMultipleBubbles2(req, res){
    const {User, Feeds, bot, Followers, Following, bubble} = req.dbModels

    const userID = req.body.userID
    const allBubbles =  req.body.bubbles

    // const userDetails = await User.findOne({id: userID}).lean()
    
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
            if(secrecySettings.custom.bubble === "Nobody"){
                return true
            } else if(secrecySettings.custom.bubble === "Everyone"){
                return false
            } else if(secrecySettings.custom.bubble === "I want to handpick"){
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

    function check_for_viewCount(thisBubble){
        if(!thisBubble.activities.iAmOnTheseFeeds){
            return true
        }

        const allFirstSetRepliers = {}

        function allWhoShare(userActivities){
            if(userActivities){
                const userActivity = userActivities.myActivities
                if(userActivity.shared || thisBubble.user.id===userID){
                    return true
                } else {
                    return false
                }
            } else {
                return false
            }
        }

        function firstRepliersAll(reply){
            for(let i=0; i<reply.length; i++){
                const current = reply[i]
                if(dataType(reply[i])=='object'){
                    allFirstSetRepliers[current.userID] = true

                    if(reply[i].reply.length){
                        firstRepliersAll(reply[i].reply)
                    }
                }
            }
            const pass = allFirstSetRepliers[userID]
            return pass
        }

        const viewCountSettings = thisBubble.settings.secrecyData.viewCount
        if(viewCountSettings){
            const {count, data, value} = viewCountSettings
            const userActivities = thisBubble.activities.iAmOnTheseFeeds[userID]
            const likeCheck = thisBubble.like.includes(userID)
            // console.log(value, count, data);

            if(userActivities){
                const userImpression = userActivities.myImpressions||0
                if(value === "As many as possible"){
                    return false
                } else if(value === "Let me specify for everyone"){
                    // console.log( userImpression);
                    if(userImpression < count || thisBubble.user.id===userID){
                        return false
                    } else {
                        return true
                    }
                } else if(value === "Let me specify for selected few"){
                    if(data[userID]){
                        if((userImpression < count) || thisBubble.user.id===userID){
                            return false
                        } else {
                            return true
                        }
                    } else {
                        return false
                    }
                } else if(value === "Let me specify a few exceptions"){
                    if(data[userID] || thisBubble.user.id===userID){
                        return false
                    } else {
                        if((userImpression < count) || thisBubble.user.id===userID){
                            return false
                        } else {
                            return true
                        }
                    }
                } else if(value === "Specify for non-engaged audience"){
                    if(likeCheck || allWhoShare(userActivities) || firstRepliersAll(thisBubble.reply)){
                        return false
                    } else {
                        if((userImpression < count) || thisBubble.user.id===userID){
                            return false
                        } else {
                            return true
                        }
                    }
                } else {
                    return true
                }
            } else {
                // return true
                return false
            }
        } else {
            return false
        }
    }

    // async function checkBubbleSettings(thisBubble){
    //     const secrecySettings = thisBubble.settings.secrecyData.atmosphere
    //     let followerDetails = null
    //     if(userDetails){
    //         followerDetails = userDetails
    //     } else {
    //         followerDetails = await User.findOne({id: userID}).lean()
    //     }
    //     // const followerDetails = await User.findOne({userID}).lean()
        
    //     if(followerDetails === null){
    //         return false
    //     }
        
    //     const {settings} = followerDetails
    //     // console.log(settings);
    //     if(secrecySettings === "None"){
    //         return true
    //     } else {
    //         if(!settings){
    //             return true
    //         } else {
    //             if(settings.secrecy.value === "Everyone"){
    //                 return true
    //             } else if(settings.secrecy.value === "Followings"){
    //                 const followingDetails = await Following.findOne({userID: followerDetails.id}).lean()
    //                 if(!followingDetails){
    //                     return false
    //                 } else {
    //                     const allFollowings = followingDetails.following
    //                     if(allFollowings[thisBubble.user.id] || (thisBubble.user.id===userID)){
    //                         return true
    //                     } else {
    //                         return false
    //                     }
    //                 }
    //             } else if(settings.secrecy.value === "Nobody"){
    //                 // console.log("Called at nobody ddd");
    //                 return false
    //             } else {
    //                 return true
    //             }
    //         }
    //     }
    // }
    
    function viewEligibity(thisBubble){
        // CHECK IF USER IS ELIGIBLE TO SEE THIS BUBBLE
        
        // if(await checkBubbleSettings(thisBubble) === false){
        //     console.log("called-xx");
        //     return false
        // } 

        if((checkForSecrecy(thisBubble) || ifForAudience(thisBubble)) && feedRef.userID!==userID && feedRef.env==='profile'){
            return false
        }
        
        if(ifForAudience(thisBubble) && feedRef.userID!==userID){
            return false
        } 
        
        if(check_for_viewCount(thisBubble)){
            return false
        }

        return true
    }

    async function getEachBubble(feedRef, data){

        if(!feedRef){
            const data = {pass: false}
            return data
        }
    
        try {
            const {bubbles, users, followers} = data

            let thisBubble = null
            if(bubbles[feedRef.postID]){
                thisBubble = bubbles[feedRef.postID]
            } else {
                thisBubble = await bubble.findOne({postID: feedRef.postID}).lean()
            }

            if(thisBubble === null){
                const data = {pass: false}
                return data
            } else {
                // FORMATTED DATA
                if(typeof(thisBubble.reply) === "string"){
                    const reply = JSON.parse(thisBubble.reply)
                    thisBubble.reply = reply
                }
                
                if(typeof(thisBubble.shareStructure) === "string"){
                    const shareStructure = JSON.parse(thisBubble.shareStructure)
                    thisBubble.shareStructure = shareStructure
                }
        
                if(typeof(thisBubble.activities) === "string"){
                // if(typeof(thisBubble.activities) !== "object"){
                    const activities = JSON.parse(thisBubble.activities)
                    thisBubble.activities = activities
                }
                
                if(!thisBubble.activities.iAmOnTheseFeeds){
                    const activities = JSON.parse(thisBubble.activities)
                    thisBubble.activities = activities
                }
                
                if(!thisBubble.activities.iAmOnTheseFeeds){
                    // console.log(thisBubble.postID);
                    const data = {pass: false}
                    return data
                }
        
                // IF THIS USER HAS NOT SEEN THIS BUBBLE BEFORE, UPDATE BUBBLE
                if(thisBubble.activities.iAmOnTheseFeeds[userID]){
                    // if user hasn't mounted on a screen
                    const activities = thisBubble.activities
                    if(!(activities.iAmOnTheseFeeds[userID].mountedOnDevice)){
                        thisBubble.activities.iAmOnTheseFeeds[userID].mountedOnDevice=true
                        activities.iAmOnTheseFeeds[userID].mountedOnDevice=true
        
                        const stringActivities = JSON.stringify(activities)
                        await bubble.updateOne({postID: feedRef.postID}, {activities: stringActivities})
                    }
                }
                
                // GET CREATOR'S DETAILS
                let bubbleCreator = null
                if(users[feedRef.userID]){
                    bubbleCreator = users[feedRef.userID]
                } else {
                    bubbleCreator = await User.findOne({id: feedRef.userID}).lean()
                }
                    
                if(!bubbleCreator){
                    return {pass: false}
                } else {
                    thisBubble.profilePhoto = bubbleCreator.profilePhotoUrl
                    thisBubble.username = bubbleCreator.userInfo.username
                    thisBubble.fullname = bubbleCreator.userInfo.fullname
                }
        
        
                // LATE UPDATES: FIRST FIND IF BUBBLE NEEDS FOLLOWERS HERE 
                // USER FOLLOWERS
                let creatorFollowers = null
                if(followers[feedRef.userID]){
                    creatorFollowers = followers[feedRef.userID]
                } else {
                    const fllw = await Followers.findOne({userID: feedRef.userID}).lean()
                    creatorFollowers = {...fllw.followers}
                }

                if(creatorFollowers){
                    // if(creatorFollowers[userID]){
                    //     thisBubble.followers = {[userID]: creatorFollowers[userID]}
                    // } else {
                    //     thisBubble.followers = {}
                    // }
                    // thisBubble.followersReady=true

                    thisBubble.followers = {...creatorFollowers}
                    thisBubble.followersReady=true
                } else {
                    thisBubble.followers = {}
                    thisBubble.followersReady=true
                }

                // GET BOTS IF BUBBLE HAS BOTS
                const bubbleSetting = thisBubble.settings
                const bots = [...Object.keys(bubbleSetting.botData)]
                if(bots.length){
                    for(let k=0; k<bots.length; k++){
                        const id = bots[k]
                        const bubbleBot = await bot.findOne({id}).lean()
                        if(!bubbleBot){
                            if(thisBubble.settings.botData[id]){
                                delete thisBubble.settings.botData[id]
                            }
                        } else {
                            if(thisBubble.settings.botData[id]){
                                thisBubble.settings.botData[id] = {...thisBubble.settings.botData[id], ...bubbleBot}
                            }
                        }
                    }
                }
                
                // // CHECK IF USER IS ELIGIBLE TO SEE THIS BUBBLE
                // const testSettings = await checkBubbleSettings(thisBubble)
                // if(!viewEligibity(thisBubble) || !testSettings){
                if(!viewEligibity(thisBubble)){
                    // res.send({successful:false, message: 'ineligible to view bubble'})
                    return {pass: false}
                } else {
                    // prepare Data to be finally sent out (dont forget bot in client side)
                    thisBubble = {
                        ...thisBubble,
                        ...feedRef.data,
                        refDoc: feedRef,
                        env: feedRef.env
                    }
                }
                
        
                // REGISTER USER TO BUBBLE ACTIVITIES IF ABSENT
                if(!thisBubble.activities.iAmOnTheseFeeds[userID]){
                    let sameBubble = await bubble.findOne({postID: feedRef.postID}).lean()
                    if(sameBubble){
                        if(typeof(sameBubble.activities) === "string"){
                            const activities = JSON.parse(sameBubble.activities)
                            sameBubble.activities = activities
                        }

                        if(!sameBubble.activities.iAmOnTheseFeeds){
                            const activities = JSON.parse(sameBubble.activities)
                            sameBubble.activities = activities
                        }

                        if(!sameBubble.activities.iAmOnTheseFeeds){
                        } else {
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
                                        // impression: true
                                    }
                                }
                                
                                thisBubble.activities = sameBubble.activities
                                const activities = JSON.stringify(sameBubble.activities)
                                await bubble.updateOne({postID: feedRef.postID}, {activities})
            
            
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
                                                if(userFeed.bubbles[i].postID === feedRef.postID){
                                                    access=false
                                                    break
                                                }
                                            }
                                        }
                                        
                                        if(access){
                                            userFeed.bubbles.push(feedRef)
                                            // await userFeed.save()
                                            await Feeds.updateOne({userID}, {bubbles: [...userFeed.bubbles]})
                                        }
                                    }
                                }
                            }
                        }
                    }
        
                }
        
        
                const now = new Date()
                const formattedDate = date.format(now, 'YYYY,MM,DD,HH,mm,ss,SS')
                thisBubble.formattedDate = formattedDate
                const data = {
                    pass: true,
                    bubble: thisBubble
                }
                return data
            }
        } catch (e){
            const data = {pass: false}
            return data
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

        const bubbleObj = {}
        const multipleBubbles = await bubble.find({postID: {$in: [...postIDs]}}).lean()
        for(let i=0; i<multipleBubbles.length; i++){
            bubbleObj[multipleBubbles[i].postID] = multipleBubbles[i]
        }

        const acquiredUsers = {}
        const bubbleCreators = await User.find({id: {$in: [...creatorIDs]}}).lean()
        for(i=0; i<bubbleCreators.length; i++){
            acquiredUsers[bubbleCreators[i].id] = bubbleCreators[i]
        }

        const acquiredFollowers = {}
        const creatorFollowers = await Followers.find({userID: {$in: [...creatorIDs]}}).lean()
        for(i=0; i<creatorFollowers.length; i++){
            acquiredFollowers[creatorFollowers[i].userID] = {...creatorFollowers[i].followers}
        }
        // console.log(acquiredFollowers);
        const data = {
            bubbles: bubbleObj,
            users: acquiredUsers,
            followers: acquiredFollowers
        }

        const requsetedBubbles = []
        for(let i=0; i<allBubbles.length; i++){
            const thisBubble = await getEachBubble(allBubbles[i], data)
            // console.log(thisBubble);
            if(thisBubble.pass){
                requsetedBubbles.push(thisBubble.bubble)
            // } else {
            //     console.log(i);
            }
        }
        // console.log(requsetedBubbles[0].followers);
        res.send({successful: true, bubbles: requsetedBubbles})
    } catch(e){
        res.send({successful: false, message: "some error occured"})
    }

}

module.exports = getMultipleBubbles2