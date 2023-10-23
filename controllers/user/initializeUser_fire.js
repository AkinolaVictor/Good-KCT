const {doc, getDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function initializeUser(req, res){
    let userID = req.body.userID
    const startUp = req.body.startUp
    
    let initialize = {}
    const result = {
        successful: false,
        message: 'User data not gotten'
    }

    const userRef = doc(database, 'users', userID)
    await getDoc(userRef).then((docSnap)=>{
        if(docSnap.exists()){
            let thisUser = {...docSnap.data()}
            thisUser.hide = false
            return thisUser
        } else {
            return null
        }
    }).then(async(user)=>{
        // bubbles
        if(user!==null){
            const bubblesRef = doc(database, 'userBubbles', userID)
            let thisUser = {...user}
            await getDoc(bubblesRef).then((docs)=>{
                if(docs.exists()){

                    const bubbles = [...docs.data().bubbles]
                    let postsData = {}
                    for(let j=0; j<bubbles.length; j++){
                        if(typeof bubbles[j] === "object"){
                            if(bubbles[j].postID){
                                postsData[bubbles[j].postID] = true
                            }
                        }
                    }

                    thisUser.bubbles = bubbles
                    thisUser.posts = postsData
                } else {
                    thisUser.bubbles = []
                    thisUser.posts = {}
                }
            }).catch(()=>{
                thisUser.bubbles = []
                thisUser.posts = {}
            })

            return thisUser
        } else {
            return user
        }
    }).then(async(user)=>{
        // followers
        if(user!==null){
            let thisUser = {...user}
            const followersRef = doc(database, 'followers', userID)
            await getDoc(followersRef).then((docs)=>{
                if(docs.exists()){
                    const followers =  {...docs.data()}
                    thisUser.followers = followers
                } else {
                    thisUser.followers = {}
                }
            }).catch(()=>{
                thisUser.followers = {}
            })

            return thisUser
        } else {
            return user
        }
    }).then(async(user)=>{
        // following
        if(user!==null){
            let thisUser = {...user}
            const followersRef = doc(database, 'following', userID)
            await getDoc(followersRef).then((docs)=>{
                if(docs.exists()){
                    const following = {...docs.data()}
                    thisUser.following = following
                } else {
                    thisUser.following = {}
                }
            }).catch(()=>{
                thisUser.following = {}
            })
            return thisUser
        } else {
            return user
        }
    }).then(async(user)=>{
        // likes
        if(user!==null){
            const thisUser = {...user}
            const bubblesRef = doc(database, 'userLikes', userID)
            await getDoc(bubblesRef).then((docs)=>{
                if(docs.exists()){
                    const likes = [...docs.data().bubbles]
                    thisUser.likes = likes
                } else {
                    thisUser.likes = []
                }
            }).catch(()=>{
                thisUser.likes = []
            })
            return thisUser
        } else {
            return user
        }
    }).then(async(user)=>{
        // replies
        if(user!==null){
            const thisUser = {...user}
            const bubblesRef = doc(database, 'userReplies', userID)
            await getDoc(bubblesRef).then((docs)=>{
                if(docs.exists()){
                    const replies = [...docs.data().bubbles]
                    thisUser.replies = replies
                } else {
                    thisUser.replies = []
                }
            }).catch(()=>{
                thisUser.replies = []
            })
            return thisUser
        } else {
            return user
        }
    }).then(async(user)=>{
        // shares
        if(user!==null){
            const thisUser = {...user}
            const bubblesRef = doc(database, 'userShares', userID)
            await getDoc(bubblesRef).then((docs)=>{
                if(docs.exists()){
                    const shares = [...docs.data().bubbles]
                    thisUser.shares = shares
                } else {
                    thisUser.shares = []
                }
            }).catch(()=>{
                thisUser.shares = []
            })
            return thisUser
        } else {
            return user
        }
    }).then(async(user)=>{
        // audience
        if(startUp){
            if(user!==null){
                let thisUser = {...user}
                const savedAudienceRef = doc(database, 'savedAudience', userID)
                await getDoc(savedAudienceRef).then((docs)=>{
                    if(docs.exists()){
                        const audience = {...docs.data()}
                        thisUser.audience = audience
                    } else {
                        thisUser.audience = {}
                    }
                }).catch(()=>{
                    thisUser.audience = {}
                })
                return thisUser
            } else {
                return user
            }
        } else {
            return user
        }
    }).then(async(user)=>{
        // feed
        if(startUp){
            if(user!==null){
                let thisUser = {...user}
                const userFeedRef = doc(database, 'feeds', userID)
                await getDoc(userFeedRef).then((docs)=>{
                    if(docs.exists()){
                        const feed = [...docs.data().bubbles]
                        thisUser.feed = feed
                    } else {
                        thisUser.feed = []
                    }
                }).catch(()=>{
                    thisUser.feed = []
                })
                return thisUser
            } else {
                return user
            }
        } else {
            return user
        }
    }).then((user)=>{
        // setup result
        if(user===null){
            res.send({successful:false, message: 'Failed to get user data, prease try again...'})
        } else {
            res.send({successful: true, data: user})
        }
    }).catch(()=>{
        res.send({successful:false, message: 'Server error: error encountered from the server when trying to get user, please try to reload this page. If problem persists, user data was not found.'})
    })
}

module.exports = initializeUser