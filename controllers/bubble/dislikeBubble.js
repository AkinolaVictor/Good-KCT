const {doc, getDoc, updateDoc, setDoc, increment} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes, deleteObject} = require('firebase/storage')
const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const {database} = require('../../database/firebase')
const { dataType } = require('../../utils/utilsExport')

async function dislikeBubble(req, res){
    const userID = req.body.userID // user.id
    const userFullname = req.body.userFullname // user.userInfo.fullname
    const thisBubble = {...req.body.thisBubble}
    // thisBubble.userID = thisBubble.user.id
    // settings, userID
    let secrecySettings = thisBubble.settings.secrecyData
    // console.log(req.body);
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
            return true
        } else if(secrecySettings.atmosphere === 'Day (Absolute openness)'){
            return false
        } else {
            return false
        }
    }

    async function LikeNotifier(which){
        if(userID!==thisBubble.userID){
            const creatorNotificationsRef = doc(database, 'notifications', thisBubble.userID)
            // const userNotificationsRef = doc(database, 'notifications', userID)
            
            // data
            function getDate(){
                const now = new Date()
                const time = date.format(now, 'h:mmA')
                const when = date.format(now, 'DD/MM/YYYY')
                const dateString = date.format(now, 'YYYY,MM,DD,HH,mm,ss')
                
                return {
                    time,
                    date: when,
                    dateString
                }
            }

            const likeData = {
                time: getDate(),
                bubbleID: thisBubble.postID,
                creatorID: thisBubble.userID,
                userID: userID,
                id: uuidv4(),
                message: `${discernUserIdentity()?'someone':userFullname} ${which==='like'?'likes':'dislikes'} your bubble`,
                identityStatus: discernUserIdentity(),
                feed: thisBubble.refDoc,
                type: 'like'
            }
            likeData.feed.env='feed'
    
            // check if 
            await getDoc(creatorNotificationsRef).then(async(snapshot)=>{
                if(!snapshot.exists()){
                    setDoc(creatorNotificationsRef, {
                        all: [likeData]
                    })
                } else {
                    // update all
                    const all=[...snapshot.data().all]
                    all.push(likeData)
                    updateDoc(creatorNotificationsRef, {all})
                }
            })
        }
    }

    const docz = doc(database, 'bubbles', thisBubble.postID)
    await getDoc(docz).then(async(docsnap)=>{
        if(docsnap.exists()){
            const posts = {...docsnap.data()}
            if(posts.like.includes(userID)){
                // posts.like.push(userID)
                const postLikes = posts.like
                for(let i=0; i<postLikes.length; i++){
                    if(postLikes[i]===userID){
                        posts.like.splice(i, 1)
                        break
                    }
                }
                
                if(!posts.totalLikes){
                    posts.totalLikes = 0
                } else {
                    posts.totalLikes--
                }
                
                // console.log(posts.activities)
                const like = posts.like
                const totalLikesValue = posts.totalLikes||0
                await updateDoc(docz, {totalLikes:totalLikesValue>0?increment(-1):0, like}).then(async()=>{
                // await updateDoc(docz, {...posts}).then(async()=>{
                    // console.log('done');
                    LikeNotifier('dislikes')
                    
                    if(thisBubble.userID!==userID){
                        const userLikesRef = doc(database, 'userLikes', userID)
                        await getDoc(userLikesRef).then((userLikes)=>{
                            if(userLikes.exists()){
                                const bubbles = [...userLikes.data().bubbles]
                                const allLikesID = []
                                
                                for(let i=0; i<bubbles.length; i++){
                                    if(dataType(bubbles[i])==='object'){
                                        // allLikesID.push(bubbles[i].postID)
                                        if(bubbles[i].postID === thisBubble.postID){
                                            bubbles.splice(i, 1)
                                        }
                                    }

                                    if(i===bubbles.length-1){
                                        updateDoc(userLikesRef, {bubbles})
                                    }
                                }
                            }
                        })
                    }
                }).catch(()=>{
                    // alert('failed to update like')
                })
            }
            
        } else {
            res.send({successful: false, message: 'bubble not found'})
        }
    }).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        res.send({successful: false, message: 'Error from the server'})
    })
}

module.exports = dislikeBubble