const {doc, getDoc, updateDoc, setDoc, deleteField} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
const {database} = require('../../database/firebase')

async function unFollow(req, res){
    const userID = req.body.userID // user.id
    const userName = req.body.userName // user.userInfo.fullname
    const newUserID = req.body.newUserID // props.data.id
    const newUserName = req.body.newUserName // props.data.userInfo.fullname

    async function FollowNotifier(which){
        if(userID !== newUserID){
            const creatorNotificationsRef = doc(database, 'notifications', newUserID)
            
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

            function constructMessage(){
                if(which==='follow'){
                    return `${userName} is now following you`
                } else {
                    return `${userName} unfollowed you`
                }
            }

            const followData = {
                time: getDate(),
                userID,
                message: constructMessage(),
                identityStatus: false,
                // feed: thisBubble.refDoc,
                type: 'follow'
            }
            // followData.feed.env='feed'
    
            // check if
            await getDoc(creatorNotificationsRef).then(async(snapshot)=>{
                if(!snapshot.exists()){
                    setDoc(creatorNotificationsRef, {
                        all: [followData]
                    })
                } else {
                    // update all
                    const all=[...snapshot.data().all]
                    all.push(followData)
                    updateDoc(creatorNotificationsRef, {all})
                }
            })
    
        }
    }

    const UnFollow = async () => {
        const docz = doc(database, 'following', userID)
        await getDoc(docz).then(async(docSnap)=>{
            const following = {...docSnap.data()}
            if(following[newUserID]){
                await updateDoc(docz, {
                    [newUserID]: deleteField()
                })
            }
        })

        
        // remove from user
        const docz2 = doc(database, 'followers', newUserID)
        await getDoc(docz2).then(async(docsnap)=>{
            if(docsnap.exists()){
                const followers = {...docsnap.data()}
                if(followers[userID]){
                    await updateDoc(docz2, {
                        [userID]: deleteField()
                    }).then(()=>{
                        FollowNotifier('unfollow')
                    })
                }
            }
        })

        // remove from audience
        const audienceRef = doc(database, 'savedAudience', newUserID)
        await getDoc(audienceRef).then(async(docsnap)=>{
            if(docsnap.exists()){
                const audience = {...docsnap.data()}
                const auds = [...Object.keys(audience)]
                for(let i=0; i<auds.length; i++){
                    const current = auds[i]
                    const subAud = audience[current].audience
                    for(let j=0; j<subAud.length; j++){
                        if(subAud[j].id===userID){
                            audience[auds[i]].audience.splice(j, 1)
                        }
                    }
                }
                // update audience
                await updateDoc(audienceRef, {audience})
                
            }
        })

        res.send({successful: true})
    }
    
    UnFollow()
}

module.exports = unFollow