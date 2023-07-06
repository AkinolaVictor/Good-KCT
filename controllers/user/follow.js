const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
const {database} = require('../../database/firebase')

async function follow(req, res){
    const userID = req.body.userID // user.id
    const userName = req.body.userName // user.userInfo.fullname
    const newUserID = req.body.newUserID // props.data.id
    const newUserName = req.body.newUserName // props.data.userInfo.fullname

    async function FollowNotifier(which){
        if(userID !== newUserID){
            const creatorNotificationsRef = doc(database, 'notifications', newUserID)
            // const userNotificationsRef = doc(database, 'notifications', user.id)
            
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
                // bubbleID: thisBubble.postID,
                // creatorID: thisBubble.user.id,
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

    const Follow = async () => {
        
        // add user id to my following
        const docz = doc(database, 'following', userID)
        await getDoc(docz).then(async(docsnap)=>{
            if(docsnap.exists()){
                const following = {...docsnap.data()}

                if(!following[newUserID]){
                    following[newUserID] = {
                        name: newUserName,
                        id: newUserID,
                        imageUrl: '',
                    }

                    await updateDoc(docz, {...following}).then(()=>{
                        
                    }).catch((err)=>{
                        res.send({successful: false, message: '`Sorry, unable to follow, error encountered while trying to follow ${newUserName}`'})
                    })
                    // setClickFollow(false)
                }
            } else {
                setDoc(docz, {
                    [newUserID]: {
                        name: newUserName,
                        id: newUserID,
                        imageUrl: ''
                    }
                })
            }
        })


        // add my id to user followers
        const docz2 = doc(database, 'followers', newUserID)
        await getDoc(docz2).then(async(docsnap)=>{
            if(docsnap.exists()){
                const followers = {...docsnap.data()}
                if(!followers[userID]){
                    followers[userID] = {
                        name: userName,
                        id: userID,
                        imageUrl: ''
                    }
                    await updateDoc(docz2, {...followers}).then(()=>{
                        FollowNotifier('follow')
                    }).catch((err)=>{
                        res.send({successful: false, message: '`Sorry, unable to follow, error encountered while trying to follow ${newUserName}`'})
                        // setClickFollow(false)
                    })
                }
            } else {
                setDoc(docz2, {
                    [userID]: {
                        name: userName,
                        id: userID,
                        imageUrl: ''
                    }
                }).catch(()=>{
                    res.send({successful: false, message: '`Sorry, unable to follow, error encountered while trying to follow ${newUserName}`'})
                })
            }
        })
        
        res.send({successful: true})
    }

    Follow()
}

module.exports = follow