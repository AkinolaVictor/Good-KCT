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
    
    // function chooseRef(data){
    //     const fileID = `${data.name}${postID}`

    //     const imageFileRef = ref(storage, `${userID}/image/${fileID}`)
    //     const videoFileRef = ref(storage, `${userID}/video/${fileID}`)
    //     const audioFileRef = ref(storage, `${userID}/audio/${fileID}`)
    //     const otherFileRef = ref(storage, `${userID}/other/${fileID}`)

    //     if(data.type[0]==='image'){
    //         return {
    //             ref: imageFileRef,
    //             path: [userID, 'image', fileID]
    //         }
    //     } else if(data.type[0]==='video'){
    //         return {
    //             ref: videoFileRef,
    //             path: [userID, 'video', fileID]
    //         }
    //     } else if(data.type[0]==='audio'){
    //         return {
    //             ref: audioFileRef,
    //             path: [userID, 'audio', fileID]
    //         }
    //     } else {
    //         return {
    //             ref: otherFileRef,
    //             path: [userID, 'other', fileID]
    //         }
    //     }
    // }
        
    // // let current = [...chosenAudience];
    // // let current2 = [...chosenAudience];
        
    // let current = [...thisBubble.bubble];
    // let current2 = [...thisBubble.bubble];
    // const allFiles=[]
    // // save all files to allFIles
    // for(let i=0; i<current.length; i++){
    //     let files = current[i].file
    //     for(let j=0; j<files.length; j++){
    //         const file= files[j]
    //         const data = {i, j, file}
    //         allFiles.push(data)
    //     }
    // }

    // // save all files in allFiles to storage, get the URL, then upload post in database
    // if(allFiles.length){
    //     for(let m=0; m<allFiles.length; m++){
    //         const i=allFiles[m].i, j=allFiles[m].j, file=allFiles[m].file

    //         const fileRef = chooseRef(file)
    //         // await uploadBytes(chooseRef(file), file.file).then((snapshot)=>{
    //         await uploadBytes(fileRef.ref, file.file).then((snapshot)=>{
    //             getDownloadURL(snapshot.ref).then((url)=>{
    //                 current2[i].file[j].src=url
    //                 // current2[i].file[j].path = [userID, file.type[0], `${file.name}${postID}`]
    //                 current2[i].file[j].path = fileRef.path
    //                 delete current2[i].file[j].file
    //                 if(m==allFiles.length-1){
    //                     // setChosenAudience([...current2]);
    //                     thisBubble.bubble = [...current2]
    //                     saveData()
    //                 }
    //             })
    //         }).catch((err)=>{
    //             alert('file failed to upload')
    //         })
    //     }
    // }else{
    //     saveData()
    // }
    saveData()

    // function getDate(){
    //     const now = new Date()
    //     const time = date.format(now, 'h:mmA')
    //     const when = date.format(now, 'DD/MM/YYYY')
    //     const dateString = date.format(now, 'YYYY,MM,DD,HH,mm,ss')
        
    //     return {
    //         time,
    //         date: when,
    //         dateString
    //     }
    // }

    // console.log('yeah');
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
}

module.exports = createBubble