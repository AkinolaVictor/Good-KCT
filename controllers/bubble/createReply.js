const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')
const date = require('date-and-time')
const { v4: uuidv4 } = require('uuid')
const { dataType } = require('../../utils/utilsExport')


async function createReply_Old(req, res){
    const path = req.body.path /* props.path */
    const creatorID = req.body.creatorID /* thisBubble.user.id */
    const postID = req.body.postID /* thisBubble.postID */
    const userID = req.body.userID /* user.id */
    const data = req.body.data /* data */
    const fullname = req.body.fullname /* user.userInfo.fullname */
    const parentName = req.body.parentName /* props.replyData.name */
    const parentID = req.body.parentID /* props.replyData.userID */
    const refDoc = req.body.refDoc /* refDoc */
    const discernUserIdentity = req.body.discernUserIdentity /* discernUserIdentity() */
    
    res.send({successful: true})
    
    function getDate(){
        const now = new Date()
        const time = date.format(now, 'h:mm:ssA')
        const when = date.format(now, 'DD/MM/YYYY')
        const dateString = date.format(now, 'YYYY,MM,DD,HH,mm,ss')
        return {
            time,
            date: when,
            dateString
        }
    }
    
    function updateLastActivity(thisPost, activity, updateFunc){
        if(!thisPost.activities.lastActivities){
            thisPost.activities.lastActivities=[]
        }
        const lastActivities = thisPost.activities.lastActivities
        const activityData = {
            activity,
            userID: userID,
            date: getDate()
        }
        if(lastActivities.length>0){
            const last = lastActivities[lastActivities.length - 1]
            if(last.activity!==activity){
                for(let i=0; i<lastActivities.length; i++){
                    const current = lastActivities[i]
                    if(current.userID===userID && current.activity===activity){
                        break
                    }
                    if(i===lastActivities.length-1){
                        thisPost.activities.lastActivities.push(activityData)
                        if(thisPost.activities.lastActivities.length>5){
                            thisPost.activities.lastActivities.shift()
                        }
                        updateFunc()
                    }
                }
            }
        } else {
            thisPost.activities.lastActivities.push(activityData)
            updateFunc()
        }
    }

    async function ReplyNotifier(){
        if(userID!==creatorID){
            // console.log('notify 1');
            const creatorNotificationsRef = doc(database, 'notifications', creatorID)
            
            function constructCreatorMessage(){
                if(discernUserIdentity){
                    if(path.length===0){
                        return `someone replied your bubble`
                    } else {
                        return `a reply was replied in your bubble`
                    }
                } else {
                    if(path.length===0){
                        return `${fullname} replied your bubble`
                    } else {
                        return `${fullname} replied to ${parentName}`
                    }
                }
            }

            // data
            const creatorData = {
                time: getDate(),
                bubbleID: postID,
                creatorID: creatorID,
                replyPath: path,
                userID: userID,
                id: uuidv4(),
                message: constructCreatorMessage(),
                identityStatus: discernUserIdentity,
                feed: refDoc,
                type: 'reply'
            }
            creatorData.feed.env='feed'
    
            // update creator
            await getDoc(creatorNotificationsRef).then(async(snapshot)=>{
                if(!snapshot.exists()){
                    // setDoc(creatorNotificationsRef, {
                    setDoc(doc(database, 'notifications', creatorID), {
                        all: [creatorData]
                    })
                } else {
                    // update all
                    const all=[...snapshot.data().all]
                    all.push(creatorData)
                    updateDoc(creatorNotificationsRef, {all})
                }
            })
        }

        // update user
        // if(path.length>0 && (props.replyData.userID!==creatorID || props.replyData.userID!==userID)){
        if(path.length>0 && (parentID!==userID)){
            const mainUserNotificationsRef = doc(database, 'notifications', parentID)

            function constructMainUserMessage(){
                if(discernUserIdentity){
                    if(path.length>0){
                        return `someone replied you`
                    }
                } else {
                    if(path.length>0){
                        return `${fullname} replied you`
                    }
                }
            }

            const mainReplyData = {
                time: getDate(),
                bubbleID: postID,
                mainReplier: parentID,
                creatorID: creatorID,
                replyPath: path,
                userID: userID,
                id: uuidv4(),
                replyCreatorID: parentID,
                message: constructMainUserMessage(),
                identityStatus: discernUserIdentity,
                feed: refDoc,
                type: 'reply'
            }
            mainReplyData.feed.env='feed'

            // console.log(mainReplyData);
            await getDoc(mainUserNotificationsRef).then(async(snapshot)=>{
                if(!snapshot.exists()){
                    // setDoc(mainUserNotificationsRef, {
                    setDoc(doc(database, 'notifications', parentID), {
                        all: [mainReplyData]
                    })
                } else {
                    // update all
                    const all=[...snapshot.data().all]
                    all.push(mainReplyData)
                    updateDoc(mainUserNotificationsRef, {all})
                }
            })
        }
    }
    
    const docz = doc(database, 'users', creatorID)
    await getDoc(docz).then(async(docSnap)=>{
        let posts = {...docSnap.data().posts}
        const thisPost = posts[postID]
        if(thisPost){
            if(posts[postID].activities.iAmOnTheseFeeds[userID].myActivities.replied){
                data.replyNumber = posts[postID].activities.iAmOnTheseFeeds[userID].replyNumber
            } else {
                // increment activity index
                if(posts[postID].activities.iAmOnTheseFeeds[userID].myActivities.activityIndex){

                } else {
                    posts[postID].activities.lastActivityIndex++
                    posts[postID].activities.iAmOnTheseFeeds[userID].myActivities.activityIndex=posts[postID].activities.lastActivityIndex
                }

                // give a number to the person replying
                if(posts[postID].activities.iAmOnTheseFeeds[userID].replyNumber){
                    data.replyNumber = posts[postID].activities.iAmOnTheseFeeds[userID].replyNumber
                }else {
                    const allOnFeed = [...Object.values(posts[postID].activities.iAmOnTheseFeeds)]
                    let count = 0
                    for(let i=0; i<allOnFeed.length; i++){
                        const current = allOnFeed[i]
                        if(current.replyNumber){
                            count++
                        }
                    }
                    posts[postID].activities.iAmOnTheseFeeds[userID].replyNumber=count+1
                    data.replyNumber = posts[postID].activities.iAmOnTheseFeeds[userID].replyNumber
                }

                posts[postID].activities.iAmOnTheseFeeds[userID].seenAndVerified=true
                posts[postID].activities.iAmOnTheseFeeds[userID].myActivities.replied=true
                // updateDoc(docz, {posts})
            }

            if(path.length === 0){
                // if(thisPost){
                    posts[postID].reply.push(data)
                    await updateDoc(docz, {posts})
                // }
            }else if(path.length === 1) {
                // if(thisPost){
                    posts[postID].reply[path[0]].reply.push(data)
                    await updateDoc(docz, {posts})
                // }
            }else if(path.length>1){
                // buildReply(path)
                const reply = posts[postID].reply

                let overallRep = [];
                let eachReply = [];

                function buildReply(path){
                    let pathClone = [...path]
                    if (eachReply.id){
                        let old = {...eachReply}
                        eachReply = {...old.reply[pathClone[0]]}
                    }else{
                        eachReply = {...reply[pathClone[0]]}
                    }
                    overallRep.push(eachReply)
                    pathClone.shift()
                    // recursion
                    if (pathClone.length!==0) {
                        buildReply(pathClone)
                    }else{
                        // console.log(overallRep);
                        return
                    }
                }

                buildReply(path)
                
                let dR = [...overallRep]
                dR[path.length-1].reply.push(data)
                // Compile Reversal
                let final
                if(path.length===2){
                    dR[0].reply[path[1]] = dR[1]
                    final = dR[0]
                } else {
                    // loop through
                    for(let i=dR.length-1; i>0; i=i-1){
                        dR[i-1].reply[path[i]] = dR[i]
                    }
                    final = dR[0]
                }
                // if(thisPost){
                    posts[postID].reply[path[0]] = final
                    await updateDoc(docz, {posts})
                // }
            }

            // update last activity
            updateLastActivity(posts[postID], 'replied', ()=>{updateDoc(docz, {posts})})
            
            // notify user(s)
            ReplyNotifier()
            
            // update yourself
            if(creatorID!==userID){
                const userRef = doc(database, 'users', userID)
                await getDoc(userRef).then(async(userDoc)=>{
                    const replies = [...userDoc.data().replies]
                    const allLikesID = []
                    for(let i=0; i<replies.length; i++){
                        if(dataType(replies[i])==='object'){
                            allLikesID.push(replies[i].postID)
                        }
                    }

                    if(!allLikesID.includes(postID)){
                        replies.push(refDoc)
                        await updateDoc(userRef, {replies})
                    }
                })
            }
        }
    })
}

module.exports = createReply_Old