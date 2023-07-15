const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes, deleteObject} = require('firebase/storage')
const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const {database} = require('../../database/firebase')
const { dataType } = require('../../utils/utilsExport')

async function confirmShareRequest(req, res){
    const userID = req.body.userID // user.id
    let data = req.body.data
    let pathOfShare = [...data.feed.sharePath]
    // const thisBubble = {...req.body.thisBubble}
    
    let overallShare = []
    let eachShare = {}
    function spreadShare(path, pathLength, shareStructure){
        let pathClone = [...path]
        if (pathClone.length<pathLength){
            let old = {...eachShare}
            eachShare = {...old[pathClone[0]]}
        }else{
            // eachShare = {...thisBubble.shareStructure[pathClone[0]]}
            eachShare = {...shareStructure[pathClone[0]]}
        }
        overallShare.push(eachShare)
        pathClone.shift()
        // recurrsion
        if (pathClone.length!==0) {
            spreadShare(pathClone, pathLength, shareStructure)
        }
    }

    function buildShare(path){
        // this function builds out the share into a singular nested objects of share: that is, {...,share:{...,share:{...,share:{...}}}}
        const usePath = [...path]
        if(overallShare.length>1){
            for (let i=overallShare.length-1; i>0; i=i-1){
                overallShare[i-1][usePath[i]] = {...overallShare[i]}
            }
            return overallShare[0]
        } else {
            return overallShare[0]
        }
    }

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

    async function confirmRequest(){
        // update my notification
        await shareBubble()
        const creatorNotificationsRef = doc(database, 'notifications', userID)
        await getDoc(creatorNotificationsRef).then(async(snapshot)=>{
            if(snapshot.exists()){
                // update all
                const all=[...snapshot.data().all]
                for(let i=0; i<all.length; i++){
                    if(all[i].id === data.id && all[i].type==='shareRequest'){
                        all[i].status = 'granted'
                        await updateDoc(creatorNotificationsRef, {all})
                        break
                    }
                }
                // updateDoc(creatorNotificationsRef, {all})
            }
        })

        // notify audience
        const newData = {...data}
        newData.message = 'Your request to share this bubble was granted, it has been automatically pushed to your followers'
        newData.status = 'granted'
        newData.time = getDate()
        
        const audienceNotificationsRef = doc(database, 'notifications', data.userID)
        await getDoc(audienceNotificationsRef).then(async(snapshot)=>{
            if(!snapshot.exists()){
                setDoc(audienceNotificationsRef, {
                    all: [newData]
                })
            } else {
                const all=[...snapshot.data().all]
                all.push(newData)
                updateDoc(audienceNotificationsRef, {all})
            }
        })
    }
    const discernPrevShares = () => {
        // if(pathOfShare.length==1 && pathOfShare[0]===userID){

        // if i'm the last person to share
        // if(pathOfShare.length==1 && pathOfShare[pathOfShare.length-1]===userID){
        if(pathOfShare.length>=1 && pathOfShare[pathOfShare.length-1]===userID){
            return pathOfShare
        } else {
            return [...pathOfShare, userID]
        }
    }

    async function shareBubble(){
        // console.log('i got here 1');
        const bubbleRef = doc(database, 'bubbles', data.feed.postID)
        await getDoc(bubbleRef).then(async(snapshot)=>{
            if(snapshot.exists()){
                // console.log('i got here 2');
                const posts = {...snapshot.data()}

                // if sharing a reply, first update the audience requesting for permission
                if(data.feed.data.path.length){
                    // if audience already got this reply
                    // console.log('i got here 3');
                    const current = posts.activities.iAmOnTheseFeeds[data.userID].replyPath
                    if(!current.includes(`${data.feed.data.path}`)){
                        const audienceRef = doc(database, 'feeds', data.userID)
                        await getDoc(audienceRef).then(async(docsnap)=>{
                            if(docsnap.exists()){
                                const bubbles = [...docsnap.data().bubbles]
                                // update
                                posts.activities.iAmOnTheseFeeds[data.userID].replyPath.push(`${data.feed.data.path}`)
                                bubbles.push(data.feed)
                                await updateDoc(audienceRef, {bubbles})
                            }
                            
                        })
                    }
                }
                // console.log('i got here 4');

                // share with audience followers
                // console.log('i got here 5');
                const audienceFollowersRef = doc(database, 'followers', data.userID)
                await getDoc(audienceFollowersRef).then(async(docsnap)=>{
                    if(docsnap.exists()){
                        const followers = [...Object.keys(docsnap.data())]

                        // loop through all followers
                        for(let i=0; i<followers.length; i++){
                            const followerFeedRef =  doc(database, 'feeds', followers[i])
                            // check if bubble does not contains a reply
                            if(!data.feed.data.path.length){
                                // check if this follower has gotten it before
                                if(!posts.activities.iAmOnTheseFeeds[followers[i]]){
                                    posts.activities.iAmOnTheseFeeds[followers[i]]={
                                        index: Object.keys(posts.activities.iAmOnTheseFeeds).length,
                                        onFeed: true, 
                                        userID: followers[i],
                                        mountedOnDevice: false, 
                                        seenAndVerified: false,
                                        replyPath: [],
                                        bots: {},
                                        myActivities: {
                                            
                                        }
                                    }
                                    await getDoc(followerFeedRef).then(async(docsnap2)=>{
                                        const bubbles = [...docsnap2.data().bubbles]
                                        data.feed.sharePath = discernPrevShares()
                                        bubbles.push(data.feed)
                                        updateDoc(followerFeedRef, {bubbles})
                                    })
                                }
                            } else {
                                // bubble contains a reply
                                // check if this follower has gotten it before
                                if(!posts.activities.iAmOnTheseFeeds[followers[i]]){
                                    posts.activities.iAmOnTheseFeeds[followers[i]]={
                                        index: Object.keys(posts.activities.iAmOnTheseFeeds).length,
                                        onFeed: true, 
                                        userID: followers[i],
                                        mountedOnDevice: false,
                                        seenAndVerified: false,
                                        replyPath: [`${data.feed.data.path}`],
                                        bots: {},
                                        myActivities: {
                                            
                                        }
                                    }
                                } else {
                                    // follower has seen this bubble befor but check if he has recieved the reply
                                    const current = posts.activities.iAmOnTheseFeeds[followers[i]].replyPath
                                    if(!current.includes(`${data.feed.data.path}`)){
                                        posts.activities.iAmOnTheseFeeds[followers[i]].replyPath.push(`${data.feed.data.path}`)
                                    }else{
                                        // if user already has the replies skip the remaining codes and move to the next counter
                                        continue
                                    }
                                }
                                await getDoc(followerFeedRef).then(async(docsnap2)=>{
                                    const bubbles = [...docsnap2.data().bubbles]
                                    data.feed.sharePath = discernPrevShares()
                                    bubbles.push(data.feed)
                                    updateDoc(followerFeedRef, {bubbles})
                                })
                            }

                        }
                    }
                })
                

                // decrease share request
                if(posts.activities.permissionRequests>0){
                    posts.activities.permissionRequests--
                }
                // console.log('i got here 2');
                // console.log('i got here 6');

                // let pathOfShare = [...thisBubble.refDoc.sharePath]
                if( pathOfShare[pathOfShare.length - 1]!==userID){
                    // const rawPath = [...data.feed.sharePath]
                    // remove the audience id from the path, it was added during share
                    // if(rawPath.length>1){
                    //     rawPath.pop()
                    // }
                    const mainPath = [...data.feed.sharePath]
                    mainPath.shift()
                    const path2 = [...mainPath]
                    if(path2.length>1){
                        // console.log('before spreadShare');
                        spreadShare(path2, path2.length, posts.shareStructure)
                        // console.log('after spreadShare');
                        // const shareHub = [...overallShare]
                        if(overallShare[overallShare.length-1][userID]===undefined){
                            overallShare[overallShare.length-1][userID] = {}
                            // build destructured share
                            // console.log('before buildShare');
                            const finalProduct = buildShare(path2)
                            // console.log('after buildShare');
                            posts.shareStructure[path2[0]] = finalProduct
                        }
                    } else if(path2.length==1){
                        posts.shareStructure[path2[0]][userID]={}
                    } else {
                        posts.shareStructure[userID]={}
                    }
    
                }
                // console.log('i got here 9');
                                        
                if(posts.activities.iAmOnTheseFeeds[data.userID].myActivities.activityIndex){
                } else {
                    posts.activities.lastActivityIndex++
                    posts.activities.iAmOnTheseFeeds[data.userID].myActivities.activityIndex = posts.activities.lastActivityIndex
                }
                posts.activities.iAmOnTheseFeeds[data.userID].myActivities.shared=true
                posts.activities.iAmOnTheseFeeds[data.userID].seenAndVerified=true

                // increase count
                posts.activities.shares++
                if(!posts.activities.allWhoHaveShared[data.userID]){
                    // posts.activities.shares++
                    posts.activities.allWhoHaveShared[data.userID]=true
                }
                
                // increase shares
                // posts.activities.shares++

                // update post
                const activities = posts.activities
                const shareStructure = posts.shareStructure
                updateDoc(bubbleRef, {activities, shareStructure})
                // console.log('i completed');
            }
        }).then(()=>{
            // console.log('done');
            res.send({successful: true})
        }).catch(()=>{
            // console.log('undone');
            res.send({successful: false, message: 'Network error: failed to share bubble'})
        })
    }
    
    confirmRequest()
    // console.log('completed');

}

module.exports = confirmShareRequest