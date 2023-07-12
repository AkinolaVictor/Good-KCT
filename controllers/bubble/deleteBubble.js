const {doc, getDoc, updateDoc, setDoc, deleteDoc} = require('firebase/firestore')
const {getDownloadURL, ref, uploadBytes, deleteObject} = require('firebase/storage')
const date = require('date-and-time')
const {database, storage} = require('../../database/firebase')

async function deleteBubble(req, res){

    // const userID = req.body.userID
    // const postID = req.body.postID // thisBubble.postID
    const thisBubble = {...req.body.thisBubble}
    // console.log(thisBubble);

    const bubble = thisBubble.bubble
    const allFilePaths = []

    // prepare all files to be deleted by pushing their path to the allFilesPath
    for(let i=0; i<bubble.length; i++){
        const files = bubble[i].file
        for(let j=0; j<files.length; j++){
            const file = files[j]
            allFilePaths.push(file.path)
        }
    }

    if(allFilePaths.length){
        // first delete all files before deleting post (if there are files to be deleted)
        for(let i=0; i<allFilePaths.length; i++){
            const path=allFilePaths[i].join('/')
            const fileRef = ref(storage, path);
            
            // delete files now
            await deleteObject(fileRef).then(async()=>{ 
                if(i===allFilePaths.length-1){
                    // then delete post when all files have been deleted
                    await delBubble()
                }
            }).catch((err)=>{
                res.send({successful: false, message: 'unable to delete files'})
            })
        }
    } else {
        // if there are no paths, just delete post
        await delBubble()
    }

    async function delBubble(){
        const theBubbleRef = doc(database, 'bubbles', thisBubble.postID)
        await getDoc(theBubbleRef).then(async(theBubble)=>{
            if(theBubble.exists()){
                const bubble = {...theBubble.data()}

                const everyoneWhoHasIt = [...Object.keys(bubble.activities.iAmOnTheseFeeds)]
                
                // clear bubble from all bots
                const bots = [...Object.keys(bubble.settings.botData)]
                for(let i=0; i<bots.length; i++){
                    const botRef = doc(database, 'bots', bots[i])
                    await getDoc(botRef).then(async(docsnap)=>{
                        if(docsnap.exists()){
                            const data = [...docsnap.data().data]
                            for(let j=0; j<data.length; j++){
                                if(data[j]===bubble.postID){
                                    data.splice(j, 1)
                                    updateDoc(botRef, {data})
                                    break
                                }
                            }
                        }
                    })
                }

                // delete bubble from eceryone who already got it
                for(let j=0; j<everyoneWhoHasIt.length; j++){
                    const current = everyoneWhoHasIt[j]

                    const feedsRef = doc(database, 'feeds', current)
                    await getDoc(feedsRef).then(async(docsnap)=>{
                        if(docsnap.exists()){
                            const bubbles = [...docsnap.data().bubbles]
                            for(let i=0; i<bubbles.length; i++){
                                let current = bubbles[i]
                                if(current.postID === thisBubble.postID){
                                    bubbles[i]='deleted'
                                }
                            }
                            updateDoc(feedsRef, {bubbles})
                        }
                    })

                    const userBubblesRef = doc(database, 'userBubbles', current)
                    await getDoc(userBubblesRef).then(async(docsnap)=>{
                        if(docsnap.exists()){
                            const bubbles = [...docsnap.data().bubbles]
                            for(let i=0; i<bubbles.length; i++){
                                let current = bubbles[i]
                                if(current.postID === thisBubble.postID){
                                    bubbles[i]='deleted'
                                }
                            }
                            updateDoc(userBubblesRef, {bubbles})
                        }
                    })

                    const userRepliesRef = doc(database, 'userReplies', current)
                    await getDoc(userRepliesRef).then(async(docsnap)=>{
                        if(docsnap.exists()){
                            const bubbles = [...docsnap.data().bubbles]
                            for(let i=0; i<bubbles.length; i++){
                                let current = bubbles[i]
                                if(current.postID === thisBubble.postID){
                                    bubbles[i]='deleted'
                                }
                            }
                            updateDoc(userRepliesRef, {bubbles})
                        }
                    })

                    const userLikesRef = doc(database, 'userLikes', current)
                    await getDoc(userLikesRef).then(async(docsnap)=>{
                        if(docsnap.exists()){
                            const bubbles = [...docsnap.data().bubbles]
                            for(let i=0; i<bubbles.length; i++){
                                let current = bubbles[i]
                                if(current.postID === thisBubble.postID){
                                    bubbles[i]='deleted'
                                }
                            }
                            updateDoc(userLikesRef, {bubbles})
                        }
                    })

                    const userSharesRef = doc(database, 'userShares', current)
                    await getDoc(userSharesRef).then(async(docsnap)=>{
                        if(docsnap.exists()){
                            const bubbles = [...docsnap.data().bubbles]
                            for(let i=0; i<bubbles.length; i++){
                                let current = bubbles[i]
                                if(current.postID === thisBubble.postID){
                                    bubbles[i]='deleted'
                                }
                            }
                            updateDoc(userSharesRef, {bubbles})
                        }
                    })

                    if(j===everyoneWhoHasIt.length-1){
                        await deleteDoc(theBubbleRef).then(()=>{
                            res.send({successful: true})
                        }).catch(()=>{
                            res.send({successful: false, message: 'failed to delete bubble'})
                        })
                    }
                    
                }
            } else {
                res.send({successful: false, message: 'Bubble not found'})
            }
        })
    }

}

module.exports = deleteBubble