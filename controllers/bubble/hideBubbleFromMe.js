const {doc, getDoc, updateDoc, setDoc, deleteDoc} = require('firebase/firestore')
const {getDownloadURL, ref, uploadBytes, deleteObject} = require('firebase/storage')
const date = require('date-and-time')
const {database, storage} = require('../../database/firebase')

async function hideBubbleForMe(req, res){

    const userID = req.body.userID
    // const postID = req.body.postID // thisBubble.postID
    const thisBubble = {...req.body.thisBubble}
    // console.log(thisBubble/.);
    if(thisBubble.userID!==userID){
        const feedsRef = doc(database, 'feeds', userID)
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

        const userBubblesRef = doc(database, 'userBubbles', userID)
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

        const userRepliesRef = doc(database, 'userReplies', userID)
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

        const userLikesRef = doc(database, 'userLikes', userID)
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

        const userSharesRef = doc(database, 'userShares', userID)
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

        res.send({successful: true})
    } else {
        res.send({successful: false, message: 'You cannot remove this bubble'})

    }

}

module.exports = hideBubbleForMe