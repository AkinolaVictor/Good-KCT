const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
const {database, storage} = require('../../database/firebase')
const sendPushNotification = require('../pushNotification/sendPushNotification')

async function createBubble(req, res){
    // res.send({successful: true})
    // console.log(req.body);
    // const data = JSON.parse(req.body.data)
    // console.log(data);
    // return
    // const userID = data.userID
    // const thisBubble = {...data.thisBubble}

    const userID = req.body.userID
    const thisBubble = {...req.body.thisBubble}
    const secrecySettings = thisBubble.settings.secrecyData
    const postID = thisBubble.postID
    // const bubbleName = req.body.bubbleName
    const bubbleName = thisBubble.type
    
    
    function discernUserIdentity(){
        if(secrecySettings.atmosphere === 'Night (Absolute secrecy)'){
            return true
        } else if(secrecySettings.atmosphere === 'Dark room (Absolute secrecy for reply only)'){
            return true
        } else if(secrecySettings.atmosphere === 'Man behind the scene'){
            return true
        } else if(secrecySettings.atmosphere === 'Annonymous' || secrecySettings.atmosphere === 'Anonymous'){
            return false
        } else if(secrecySettings.atmosphere === 'On mask'){
            return true
        } else if(secrecySettings.atmosphere === 'I see you all'){
            return false
        } else if(secrecySettings.atmosphere === 'Just know its me'){
            return false
        } else {
            return false
        }
    }

    function decideNotifyIcon(){
        const userIcon = thisBubble.user.profilePhoto.length?thisBubble.user.profilePhoto:false
        if(discernUserIdentity() || userIcon === false){
            return false
        } else {
            return userIcon
        }
    }
    
    // all file are uploaded on the client side
    // saveData_old()
    saveData_New()

    async function saveData_old(){
        // gather all data to be forwarded as bubble
        // update settings time for self-destructure

        const settings = thisBubble.settings
        settings.selfDestructData.currentDate = thisBubble.createdDate

        // update bot
        const botData = [...Object.keys(settings.botData)]
        if(botData.length){
            for(let k=0; k<botData.length; k++){
                const eachBot = botData[k]
                const botRef = doc(database, 'bots', eachBot)
                await getDoc(botRef).then(async(snapshot)=>{
                    const data = [...snapshot.data().data]
                    if(!data.includes(postID)){
                        data.push(postID)
                        updateDoc(botRef, {data})
                    }
                    // if(k===botData.length-1){
                    // }
                })
            }
        }

        // feedRef
        const feedRef = {
            userID,
            postID,
            type: 'Ref',
            status: 'active',
            sharePath:[userID],
            data:{
                // type: chosenBubble.name
                type: bubbleName
            }
        }

        
        const docz = doc(database, 'users', userID)
        await getDoc(docz).then(async(mainDocsnap)=>{
            const data = mainDocsnap.data()
    
            let posts = {...data.posts}
            posts[postID] = thisBubble
    
            const myBubbles=[...data.bubbles]
            myBubbles.push(feedRef)

            // update my feed
            let feed = [...data.feed]
            feed.push(feedRef)
    
            // feeds this post is on
            // Old data structure
            const allBubbleAudience = [...thisBubble.audience]
            for(let i=0; i<allBubbleAudience.length; i++){
                posts[postID].activities.iAmOnTheseFeeds[allBubbleAudience[i]] = {
                    index: Object.keys(posts[postID].activities.iAmOnTheseFeeds).length,
                    onFeed: true, 
                    mountedOnDevice: false,
                    userID: allBubbleAudience[i],
                    seenAndVerified: false,
                    replyPath: [],
                    myActivities: {
                        
                    }
                }
            }

            await updateDoc(docz, {feed, posts, bubbles: myBubbles}).then(async ()=>{
                for(let i=0; i<allBubbleAudience.length; i++){
                    const followersRef = doc(database, 'users', allBubbleAudience[i])
                    await getDoc(followersRef).then(async(docu)=>{
                        const data = docu.data()
                        const theirFeed = [...data.feed]
                        theirFeed.push(feedRef)
                        await updateDoc(followersRef, {feed: theirFeed})
                    })
                    // const theirFeed = [...docSnap.data().feed]
                }
                res.send({successful: true})
            }).catch(()=>{
                res.send({successful: false, message: 'failed to upload bubble'})
            })

            // setup bubble creation 
            // New data structure
    
            // const allBubbleAudience = [...thisBubble.audience]
            // for(let i=0; i<allBubbleAudience.length; i++){
            //     thisBubble.activities.iAmOnTheseFeeds[allBubbleAudience[i]] = {
            //         index: Object.keys(thisBubble.activities.iAmOnTheseFeeds).length,
            //         onFeed: true, 
            //         mountedOnDevice: false,
            //         userID: allBubbleAudience[i],
            //         seenAndVerified: false,
            //         replyPath: [],
            //         myActivities: {
            //         }
            //     }
            // }
            
            // const bubbleRef = doc(database, 'bubbles', postID)
            // const userBubbleRef = doc(database, 'userbubbles', userID)
            // const userFeedRef = doc(database, 'feeds', userID)
            // // const userRef = doc(database, 'users', userID)
        
            // // create bubble
            // await setDoc(bubbleRef, {...thisBubble}).then(async(result)=>{
        
            //     // update user feed
            //     await getDoc(userFeedRef).then((docsnap)=>{
            //         if(docsnap.exists()){
            //             const bubbles = [...docsnap.data().bubbles]
            //             bubbles.push(feedRef)
            //             updateDoc(userFeedRef, {bubbles})
            //         } else {
            //             setDoc(userFeedRef, {
            //                 bubbles: [feedRef]
            //             })
            //         }
            //     })
        
            //     // update user bubble
            //     await getDoc(userBubbleRef).then((docsnap)=>{
            //         if(docsnap.exists()){
            //             const bubbles = [...docsnap.data().bubbles]
            //             bubbles.push(feedRef)
            //             updateDoc(userBubbleRef, {bubbles})
            //         } else {
            //             setDoc(userBubbleRef, {
            //                 bubbles: [feedRef]
            //             })
            //         }
            //     })
    
            //     // // add to user
            //     // await getDoc(userRef).then((docsnap)=>{
            //     //     const postIDs = [...docsnap.data().postIDs]
            //     //     postIDs.push(feedRef)
            //     //     updateDoc(userRef, {postIDs})
            //     // })
                
            //     // give feed to others
            //     const allBubbleAudience = [...thisBubble.audience]
            //     for(let i=0; i<allBubbleAudience.length; i++){
            //         const followersRef = doc(database, 'feeds', allBubbleAudience[i])
            //         await getDoc(followersRef).then(async(docsnap)=>{
            //             if(docsnap.exists()){
            //                 const bubbles = [...docsnap.data().bubbles]
            //                 bubbles.push(feedRef)
            //                 await updateDoc(followersRef, {bubbles})
            //             } else {
            //                 setDoc(followersRef, {
            //                     bubbles: [feedRef]
            //                 })
            //             }
            //         })
            //     }
                // res.send({successful: true})
            // }).catch(()=>{
            //     res.send({successful: false, message: 'bubble failed to upload to database'})
            // })
        }).catch(()=>{
            res.send({successful: false, message: 'failed to upload bubble'})
        })
    }

    async function saveData_New(){
        // gather all data to be forwarded as bubble
        // update settings time for self-destructure

        const settings = thisBubble.settings
        settings.selfDestructData.currentDate = thisBubble.createdDate

        const botData = [...Object.keys(settings.botData)]
        if(botData.length){
            for(let k=0; k<botData.length; k++){
                const eachBot = botData[k]
                const botRef = doc(database, 'bots', eachBot)
                await getDoc(botRef).then(async(snapshot)=>{
                    const data = [...snapshot.data().data]
                    if(!data.includes(postID)){
                        data.push(postID)
                        updateDoc(botRef, {data})
                    }
                    // if(k===botData.length-1){
                    // }
                })
            }
        }


        const feedRef = {
            userID,
            postID,
            type: 'Ref',
            status: 'active',
            sharePath:[userID],
            data:{
                // type: chosenBubble.name
                type: bubbleName
            }
        }

        thisBubble.feedRef = feedRef
        
        const allBubbleAudience = [...thisBubble.audience]
        for(let i=0; i<allBubbleAudience.length; i++){
            thisBubble.activities.iAmOnTheseFeeds[allBubbleAudience[i]] = {
                index: Object.keys(thisBubble.activities.iAmOnTheseFeeds).length,
                onFeed: true, 
                mountedOnDevice: false,
                userID: allBubbleAudience[i],
                seenAndVerified: false,
                replyPath: [],
                myActivities: {
                }
            }
        }
        // setup bubble creation 
        // New data structure
        
        const bubbleRef = doc(database, 'bubbles', postID)
        const userBubbleRef = doc(database, 'userBubbles', userID)
        const userFeedRef = doc(database, 'feeds', userID)
        // const userRef = doc(database, 'users', userID)
    
        // create bubble
        await setDoc(bubbleRef, {...thisBubble}).then(async(result)=>{
    
            // update user feed
            await getDoc(userFeedRef).then((docsnap)=>{
                if(docsnap.exists()){
                    const bubbles = [...docsnap.data().bubbles]
                    bubbles.push(feedRef)
                    updateDoc(userFeedRef, {bubbles})
                } else {
                    setDoc(userFeedRef, {
                        bubbles: [feedRef]
                    })
                }
            }).catch(()=>{
                
            })
    
            // update user bubble
            await getDoc(userBubbleRef).then((docsnap)=>{
                if(docsnap.exists()){
                    const bubbles = [...docsnap.data().bubbles]
                    bubbles.push(feedRef)
                    updateDoc(userBubbleRef, {bubbles})
                } else {
                    setDoc(userBubbleRef, {
                        bubbles: [feedRef]
                    })
                }
            }).catch(()=>{
                
            })

            // // add to user
            // await getDoc(userRef).then((docsnap)=>{
            //     const postIDs = [...docsnap.data().postIDs]
            //     postIDs.push(feedRef)
            //     updateDoc(userRef, {postIDs})
            // })
            
            // give feed to others
            // const allBubbleAudience = [...thisBubble.audience]
            for(let i=0; i<allBubbleAudience.length; i++){
                const followersRef = doc(database, 'feeds', allBubbleAudience[i])
                await getDoc(followersRef).then(async(docsnap)=>{
                    if(docsnap.exists()){
                        const bubbles = [...docsnap.data().bubbles]
                        bubbles.push(feedRef)
                        await updateDoc(followersRef, {bubbles})
                    } else {
                        setDoc(followersRef, {
                            bubbles: [feedRef]
                        })
                    }
                }).then(()=>{
                    function constructTitle(){
                        if(discernUserIdentity()){
                            return "someone you're following created a bubble"
                        } else {
                            return `${thisBubble.user.name} created a bubble`
                        }
                    }

                    const discrenMessage = () => {
                        const bubble = thisBubble.bubble
                        for(let i=0; i<bubble.length; i++){
                            if(bubble[i].name==='Everyone'){
                                let message = ''

                                // building message
                                const config = bubble[i].config
                                for(let j=0; j<config.length; j++){
                                    const tweak = config[j].tweak
                                    const word = config[j].word
                                    if(word ==='(%%%---!!!@@@###&&&)'){
                                    } else if( word ==='(%%%%----!!!!@@@@####&&&&)'){
                                    } else {
                                        if(tweak.name === 'none'){
                                            message = message + `${word} `
                                        } else if (tweak.name ==='description'){
                                            message = message + `${word} `
                                        } else if (tweak.name ==='hide'){
                                            // message = message + `${word} `
                                        } else{
                                            message = message + `*** `
                                        }
                                    }
                                }


                                return message.length?message:`You're selected among those who can view the content of this bubble.`
                            } else {
                                if(bubble[i].audience.includes(allBubbleAudience[i])){
                                    let message = ''

                                    // building message
                                    const config = bubble[i].config
                                    for(let j=0; j<config.length; j++){
                                        const tweak = config[j].tweak
                                        const word = config[j].word
                                        if(tweak.name === 'none'){
                                            message = message + `${word} `
                                        } else if (tweak.name ==='description'){
                                            message = message + `${word} `
                                        } else if (tweak.name ==='hide'){
                                            // message = message + `${word} `
                                        } else{
                                            message = message + `*** `
                                        }
                                    }


                                    return message.length?message:`You're selected among those who can view the content of this bubble.`
                                } else {
                                    return `You're selected among those who can view the content of this bubble.`
                                }
                            }
                        }
                        return `You're selected among those who can view the content of this bubble.`
                    }

                    const data = {
                        title: `${constructTitle()}`,
                        body: discrenMessage(),
                        icon: decideNotifyIcon()
                    }
                    sendPushNotification(allBubbleAudience[i], data)
                })
            }

        }).then(()=>{
            res.send({successful: true})
        }).catch(()=>{
            res.send({successful: false, message: 'bubble failed to upload to database'})
        })

    }
}

module.exports = createBubble