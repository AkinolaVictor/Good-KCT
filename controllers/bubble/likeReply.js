const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const { v4: uuidv4 } = require('uuid')
const date = require('date-and-time')
const {database} = require('../../database/firebase')

async function likeReply(req, res){
    const bubbleID = req.body.bubbleID
    const bubbleCreator = req.body.bubbleCreator
    const userID = req.body.userID
    const path = req.body.path // props.path
    const fullname = req.body.userFullname
    const replyCreatorName = req.body.replyCreatorName
    const refDoc = req.body.refDoc
    const hideIdentity = req.body.hideIdentity
    const secrecySettings = req.body.secrecySettings
    const replyCreatorID = req.body.replyCreatorID
    const replyDataID = req.body.replyDataID
    
    // remove from audience
    let overallRep = []
    let eachReply = []

    function buildReply(path, reply){
        let pathClone = [...path]
        if (eachReply.id){
            let old = {...eachReply}
            eachReply = {...old.reply[pathClone[0]]}
        }else{
            eachReply = {...reply[pathClone[0]]}
        }
        overallRep.push(eachReply)
        pathClone.shift()
        // recurrsion
        if (pathClone.length!==0) {
            buildReply(pathClone, reply)
        }
    }

    function discernUserIdentity(){
        if(hideIdentity){
            return true
        }

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

    async function LikeReplyNotifier(){
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
        
        if(userID!==bubbleCreator){
            const creatorNotificationsRef = doc(database, 'notifications', bubbleCreator)
            
            function constructCreatorMessage(){
                if(discernUserIdentity()){
                    return `someone likes a reply`
                } else {
                    return `${fullname} likes ${replyCreatorName} reply`
                }
            }

            // data
            const creatorData = {
                time: getDate(),
                bubbleID,
                creatorID: bubbleCreator,
                userID,
                id: uuidv4(),
                message: constructCreatorMessage(),
                identityStatus: discernUserIdentity(),
                feed: refDoc,
                type: 'like'
            }
            creatorData.feed.env='feed'

            // update creator
            await getDoc(creatorNotificationsRef).then(async(snapshot)=>{
                if(!snapshot.exists()){
                    setDoc(creatorNotificationsRef, {
                        all: [creatorData]
                    })
                } else {
                    // update all
                    const all = [...snapshot.data().all]
                    all.push(creatorData)
                    updateDoc(creatorNotificationsRef, {all})
                }
            })
        }


        // update user
        if(path.length>0 && replyCreatorID!==bubbleCreator){
            const mainUserNotificationsRef = doc(database, 'notifications', replyCreatorID)
            function constructMainUserMessage(){
                if(discernUserIdentity()){
                    return `someone likes your reply`
                } else {
                    return `${replyCreatorName} likes your reply`
                }
            }

            const maiReplyData = {
                time: getDate(),
                bubbleID: bubbleID,
                mainReplier: replyDataID,
                creatorID: bubbleCreator,
                id: uuidv4(),
                userID: userID,
                replyCreatorID: '',
                message: constructMainUserMessage(),
                identityStatus: discernUserIdentity(),
                feed: refDoc
            }
            maiReplyData.feed.env='feed'

            await getDoc(mainUserNotificationsRef).then(async(snapshot)=>{
                if(!snapshot.exists()){
                    setDoc(mainUserNotificationsRef, {
                        all: [maiReplyData]
                    })
                } else {
                    // update all
                    const all=[...snapshot.data().all]
                    all.push(maiReplyData)
                    updateDoc(mainUserNotificationsRef, {all})
                }
            })
        }
    }

    const docz = doc(database, 'bubbles', bubbleID)
    await getDoc(docz).then(async(docsnap)=>{
        // console.log('i ran');
        if(docsnap.exists()){
            let posts = {...docsnap.data()}
            const replys = posts.reply

            // let path = [...path]
            buildReply(path, replys)
    
            // destructured replies
            let dR = [...overallRep]
            // add like
            dR[dR.length-1].like.push(userID)
            let final;
            // loop through path and create final
            for(let i=path.length-1; i>0; i=i-1){
                dR[i-1].reply[path[i]] = dR[i]
            }
            final = dR[0]
                
            posts.reply[path[0]] = final;
            const reply = posts.reply
            await updateDoc(docz, {reply}).then(()=>{
                LikeReplyNotifier()
            })

        } else {
            res.send({successful: false, message: 'Bubble not found'})
        }
    }).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        res.send({successful: false, message: 'An error occured from the server side'})
    })

    
}

module.exports = likeReply