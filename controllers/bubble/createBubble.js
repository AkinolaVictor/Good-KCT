const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
const {database, storage} = require('../../database/firebase')

async function createBubble(req, res){
    res.send({successful: true})

    const userID = req.body.userID
    const thisBubble = {...req.body.thisBubble}

    const postID = thisBubble.postID
    // const bubbleName = req.body.bubbleName
    const bubbleName = thisBubble.type
    
    // all file are uploaded on the client side
    saveData()
    // saveData_New()

    async function saveData(){
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
            //     // res.send({successful: true})
            // }).catch(()=>{
            //     res.send({successful: false, message: 'bubble failed to upload to database'})
            // })
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

            // setup bubble creation 
            // New data structure
    
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
            
            const bubbleRef = doc(database, 'bubbles', postID)
            const userBubbleRef = doc(database, 'userbubbles', userID)
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
                    })
                }
                // res.send({successful: true})
            }).catch(()=>{
                res.send({successful: false, message: 'bubble failed to upload to database'})
            })
        })
    }
}

module.exports = createBubble