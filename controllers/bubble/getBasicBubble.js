const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function getBasicBubble(req, res){
    let userID = req.body.userID
    const feedRef = req.body.feedRef


    if(!feedRef){
        res.send({successful: false, message: 'some error occured while trying to get bubble'})
    }
    // console.log(feedRef);
    const bubbleRef = doc(database, 'bubbles', feedRef.postID)
    await getDoc(bubbleRef).then(async(docSnap)=>{
            if(docSnap.exists()){
                // getUserAndFollowers()
                const bubble = {...docSnap.data()}

                // FORMAT DATA 
                if(typeof(bubble.reply) === "string"){
                    const reply = JSON.parse(bubble.reply)
                    bubble.reply = reply
                }
                
                // INSERT FORMATTED DATA
                if(typeof(bubble.shareStructure) === "string"){
                    const shareStructure = JSON.parse(bubble.shareStructure)
                    bubble.shareStructure = shareStructure
                }
                
                // update mountedOnDevice in activities if user has seen the bubble
                if(bubble.activities.iAmOnTheseFeeds[userID]){
                    // if he hasn't mounted on a screen
                    const activities = bubble.activities
                    if(!(activities.iAmOnTheseFeeds[userID].mountedOnDevice)){
                        bubble.activities.iAmOnTheseFeeds[userID].mountedOnDevice=true
                        activities.iAmOnTheseFeeds[userID].mountedOnDevice=true
                        await updateDoc(bubbleRef, {activities})
                    }
                }
                return bubble
            } else {
                return null
            }
    }).then(async(bubble)=>{
        // bubbles
        if(bubble!==null){
            let thisBubble = {...bubble}
            const creatorRef = doc(database, 'users', feedRef.userID)
            let pass = false
            await getDoc(creatorRef).then((docsnap)=>{
                if(docsnap.exists()){
                    pass = true
                    const user = {...docsnap.data()}
                    thisBubble.profilePhoto = user.profilePhotoUrl
                    thisBubble.username = user.userInfo.username
                    thisBubble.fullname = user.userInfo.fullname
                } else {
                    pass = false
                }
            }).catch(()=>{
                pass = false
            })

            if(pass){
                return thisBubble
            } else {
                return null
            }
        } else {
            return bubble
        }
    }).then(async(bubble)=>{
        if(bubble!==null){
            let thisBubble = {...bubble}
            // FIND IF BUBBLE NEEDS FOLLOWERS HERE
            // if(true){ 
                // IF THE BUBBLE REQUIRES FOLLOWER
                const creatorFollowerRef = doc(database, 'followers', feedRef.userID)
                await getDoc(creatorFollowerRef).then((docsnap)=>{
                    if(docsnap.exists()){
                        const followers = {...docsnap.data()}
                        thisBubble.followers = followers
                        thisBubble.followersReady=true
                    } else {
                        thisBubble.followers={}
                        thisBubble.followersReady=true
                    }
                }).catch(()=>{
                    thisBubble.followers={}
                    thisBubble.followersReady=true
                })

                return thisBubble
            // } else {
            //     // If we dont need the followers
            //     return thisBubble
            // }
        } else {
            return bubble
        }
        
    }).then(async(bubble)=>{
        if(bubble!=null){
            let thisBubble = {...bubble}
            const bubbleSetting = thisBubble.settings
            const bots = [...Object.keys(bubbleSetting.botData)]
            if(bots.length){
                for(let k=0; k<bots.length; k++){
                    // getBot(bots[k])

                    // if(k===bots.length-1){
                    //     return thisBubble
                    // }
                    const id = bots[k]
                    const botRef = doc(database, 'bots', id)
                    await getDoc(botRef).then((docsnap)=>{
                        if(docsnap.exists()){
                            if(thisBubble.settings.botData[id]){
                                thisBubble.settings.botData[id] = {...thisBubble.settings.botData[id], ...docsnap.data()}
                            }
                        } else {
                            if(thisBubble.settings.botData[id]){
                                delete thisBubble.settings.botData[id]
                            }
                        }
                    }).catch(()=>{
                        // do nothing
                    })
                }
                
                async function getBot(id){
                    const botRef = doc(database, 'bots', id)
                    await getDoc(botRef).then((docsnap)=>{
                        if(docsnap.exists()){
                            if(thisBubble.settings.botData[id]){
                                thisBubble.settings.botData[id] = {...thisBubble.settings.botData[id], ...docsnap.data()}
                            }
                        } else {
                            if(thisBubble.settings.botData[id]){
                                delete thisBubble.settings.botData[id]
                            }
                        }
                    }).catch(()=>{
                        // do nothing
                    })
                }
                return thisBubble
            } else {
                return bubble
            }
        } else {
            return bubble
        }
    }).then(async(bubble)=>{
        if(bubble!==null){
            const thisBubble = {...bubble}

            function checkForSecrecy(){
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

            function ifForAudience(){
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

            if((checkForSecrecy() || ifForAudience()) && feedRef.userID!==userID && feedRef.env==='profile'){
                return null
            } else if(ifForAudience() && feedRef.userID!==userID){
                return null
            } else {
                // prepare Data to be finally sent out (dont forget bot in client side)
                const finalData = {
                    ...thisBubble,
                    ...feedRef.data,
                    refDoc: feedRef,
                    env: feedRef.env
                }
                return finalData
            }

        } else {
            return bubble
        }
    }).then(async(bubble)=>{
        if(bubble!==null){
            if(!bubble.activities.iAmOnTheseFeeds[userID]){
                const bubbleRef = doc(database, 'bubbles', feedRef.postID)
                let thisBubble = {...bubble}
                await getDoc(bubbleRef).then(async(docsnap)=>{
                    if(docsnap.exists()){
                        const post = {...docsnap.data()}
                        if(!post.activities.iAmOnTheseFeeds[userID]){
                            post.activities.iAmOnTheseFeeds[userID] = {
                                index: Object.keys(post.activities.iAmOnTheseFeeds).length,
                                onFeed: true, 
                                mountedOnDevice: false,
                                userID: userID,
                                seenAndVerified: false,
                                replyPath: [],
                                myActivities: {
                                    impression: true
                                }
                            }
                
                            const activities = post.activities
                            thisBubble.activities = activities
                            await updateDoc(bubbleRef, {activities})
                            // give feed ref to user---to be on a safe zone, i have to initialize as deleted...
                
                            const userFeedRef = doc(database, 'feeds', userID)
                            await getDoc(userFeedRef).then(async(snapshot)=>{
                                if(snapshot.exists()){
                                    const bubbles = [...snapshot.data().bubbles]
                                    
                                    for(let i=0; i<bubbles.length; i++){
                                        if(dataType(bubbles[i])==='object'){
                                            if(bubbles[i].postID === feedRef.postID){
                                                return
                                            }
                                        }
                                    }
                                    
                                    bubbles.push(feedRef)
                                    await updateDoc(userFeedRef, {bubbles})
                                }
                            }).catch(()=>{})
                        }
                        return thisBubble
                    } else {
                        return bubble
                    }
                }).catch(()=>{})
                return thisBubble
            } else {
                return bubble
            }
        } else {
            return bubble
        }
    }).then((bubble)=>{
        if(bubble!==null){
            res.send({successful: true, bubble})
        } else {
            res.send({successful: false, message: 'some error occured while trying to get bubble'})
        }
    }).catch(()=>{
        res.send({successful:false, message: 'Server error occured'})
    })
}

module.exports = getBasicBubble