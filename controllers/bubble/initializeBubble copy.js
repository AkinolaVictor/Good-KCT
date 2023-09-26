const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function initializeBubble(req, res){
    let userID = req.body.userID
    const startUp = req.body.startUp
    
    let initialize = {}
    const result = {
        successful: false,
        message: 'User data not gotten'
    }

    try{
        // const userRef = doc(database, 'users', userID)
        const bubbleRef = doc(database, 'bubbles', postRef.postID)
        await getDoc(userRef).then(async(docSnap)=>{
            const creatorFollowerRef = doc(database, 'followers', postRef.userID)
            const creatorRef = doc(database, 'users', postRef.userID)
                if(docSnap.exists()){
                    // getUserAndFollowers()
                    const post = {...docSnap.data()}

                    // FORMAT DATA 
                    if(typeof(post.reply) === "string"){
                        const reply = JSON.parse(post.reply)
                        post.reply = reply
                    }
                    
                    // INSERT FORMATTED DATA
                    if(typeof(post.shareStructure) === "string"){
                        const shareStructure = JSON.parse(post.shareStructure)
                        post.shareStructure = shareStructure
                    }
                    
                    const bubbleSetting = post.settings
                    // update mountedOnDevice in activities if user has seen the post
                    if(post.activities.iAmOnTheseFeeds[user.id]){
                        // if he hasn't mounted on a screen
                        const activities = post.activities
                        if(!(activities.iAmOnTheseFeeds[user.id].mountedOnDevice)){
                            post.activities.iAmOnTheseFeeds[user.id].mountedOnDevice=true
                            activities.iAmOnTheseFeeds[user.id].mountedOnDevice=true
                            await updateDoc(bubbleRef, {activities})
                        }
                    }


                    function getUserAndFollowers(){
                        onSnapshot(creatorFollowerRef, async(snapshot)=>{
                            if(snapshot.exists()){
                                const userFollowers = {...snapshot.data()}
                                setThisBubble((prev)=>{
                                    if(prev!==null){
                                        const curr = {...prev}
                                        curr.followers = userFollowers
                                        curr.followersReady=true
                                        return curr
                                    }
                                })
                            }else{
                                setThisBubble((prev)=>{
                                    if(prev!==null){
                                        const curr = {...prev}
                                        curr.followers = {}
                                        curr.followersReady=true
                                        return curr
                                    }
                                })
                            }
                        })
    
                        onSnapshot(creatorRef, async(snapshot)=>{
                            if(snapshot.exists()){
                                let data = {...snapshot.data()}
                                setThisBubble((prev)=>{
                                    if(prev !== null){
                                        let curr = {...prev}
                                        curr.profilePhoto = data.profilePhotoUrl
                                        curr.username = data.userInfo.username
                                        curr.fullname = data.userInfo.fullname
                                        return curr
                                    }
                                })

                                // setUserDoc((prev)=>{
                                //     let curr = {...prev}
                                //     curr.profilePhoto = data.profilePhotoUrl
                                //     curr.username = data.userInfo.username
                                //     curr.fullname = data.userInfo.fullname
                                //     return curr
                                // })

                                // if(checker.length<2){
                                //     setChecker((prev)=>{
                                //         let curr = [...prev]
                                //         if(!curr.includes('user')){
                                //             curr.push('user')
                                //         }
                                //         return curr
                                //     })
                                // }
                            }
                        })
                    }
        

                    function checkForSecrecy(){
                        const secrecySettings = bubbleSetting.secrecyData.atmosphere
                        if(secrecySettings==='On mask'){
                            return true 
                        } else if (secrecySettings === 'Annonymous' || secrecySettings === 'Anonymous'){
                            return true
                        } else if (secrecySettings === 'Man behind the scene'){
                            return true
                        } else if (secrecySettings === 'Just know its me'){
                            return true
                        } else if (secrecySettings === 'Night (Absolute secrecy)'){
                            return true
                        }
                    }

                    function listenForUserFollowers(){
                        let followers = {}
                        EmitEvent.addListener(`followers-${postRef.userID}`, (data)=>{
                            followers = data.userFollowers
                        })
                        return followers
                    }

                    function ifForAudience(){
                        const bubble = post.bubble
                        const allAudience = post.audience
                        const audienceNames = []
                        for(let i=0; i<bubble.length; i++){
                            audienceNames.push(bubble[i].name)
                        }

                        if(audienceNames.includes('Everyone')){
                            return false
                        } else if(audienceNames.includes('My Followers')){
                            if(thisBubble || listenForUserFollowers()[user.id]){
                                if(listenForUserFollowers()[user.id]|| thisBubble.followers[user.id]){
                                    return false
                                } else {
                                    return true
                                }
                            } else {
                                return true
                            }
                        } else {
                            if(allAudience.includes(user.id)){
                                return false
                            } else {
                                return true
                            }
                        }
                    }
                    
                    function checkForAudience(){
                        const bubble = post.bubble
                        const allAudience = post.audience
                        const audienceNames = []
                        for(let i=0; i<bubble.length; i++){
                            audienceNames.push(bubble[i].name)
                        }
                        if(audienceNames.includes('Everyone')){
                            return false
                        } else if (audienceNames.includes('My Followers')){
                            if(thisBubble || listenForUserFollowers()[user.id]){
                                if(listenForUserFollowers()[user.id]|| thisBubble.followers[user.id]){
                                    return false
                                } else {
                                    return true
                                }
                            } else {
                                return true
                            }
                        } else {
                            if(allAudience.includes(user.id)){
                                return false
                            } else {
                                return true
                            }
                        }
                    }

                    function getBubbleBots(){
                        const bots = [...Object.keys(bubbleSetting.botData)]

                        async function getBot(id){
                            const botRef = doc(database, 'bots', id)
                            onSnapshot(botRef, (docSnap)=>{
                                setOnUpdate((prev)=>{
                                    return prev+1
                                })
                                if(docSnap.exists()){
                                    if(post.settings.botData[id]){
                                        post.settings.botData[id] = {...post.settings.botData[id], ...docSnap.data()}
                                    }
                                }else{
                                    if(post.settings.botData[id]){
                                        delete post.settings.botData[id]
                                    }
                                }
                            })
                        }

                        for(let k=0; k<bots.length; k++){
                            getBot(bots[k])
                            if(k===bots.length-1){
                                const botData = {bubble: post, user, openGeneralModal, dataType, database, setThisBubble, setBotPopUpData, baseUrl}
                                post.bot = {...BubbleBotEngine(botData)}
                                post.botReady = true
                            }
                        }
                    }
                    
                    getBubbleBots()

                    setOnUpdate((prev)=>{
                        return prev+1
                    })

                    if((checkForSecrecy() || checkForAudience()) && postRef.userID!==user.id && postRef.env==='profile'){
                        setThisBubble(null)
                    } else if(ifForAudience() && postRef.userID!==user.id){
                        setThisBubble(null)
                    } else {
                        // console.log(checker);
                        // if(checker.length>=2){
                            setThisBubble((prev)=>{
                                // setThisBubble({
                                const curr = {...prev, ...post, ...postRef.data, refDoc: postRef, env:postRef.env}
                                if(!curr.username){
                                    curr.profilePhoto = ''
                                    curr.username = ''
                                    curr.fullname = curr.user.name||''
                                }
                                if(!curr.followers){
                                    curr.followers={}
                                    curr.followersReady=false
                                }
                                return curr

                                // ...post, 
                                // ...postRef.data, 
                                // refDoc: postRef, 
                                // followers,
                                // env:postRef.env, 
                                // profilePhoto: '', 
                                // username: '...', 
                                // fullname: '...'
                            })
                        // }
                    }
                    
                } else {
                    setThisBubble(null)
                }
        }).then(async()=>{
            // bubbles
            const bubblesRef = doc(database, 'userBubbles', userID)
            await getDoc(bubblesRef).then((docs)=>{
                if(docs.exists()){
                    const bubbles = [...docs.data().bubbles]
                    let postsData = {}
                    for(let j=0; j<bubbles.length; j++){
                        postsData[bubbles[j].postID] = true
                    }
                    if(initialize!==null){
                        initialize={...initialize, bubbles, posts: {...postsData}}
                    }
                } else {
                    if(initialize!==null){
                        initialize={...initialize, bubbles: [], posts: {}}
                    }
                }
            }).catch(()=>{
                if(initialize!==null){
                    initialize={...initialize, bubbles: [], posts: {}}
                }
            })
        }).then(async()=>{
            // followers
            const followersRef = doc(database, 'followers', userID)
            await getDoc(followersRef).then((docs)=>{
                if(docs.exists()){
                    const followers =  {...docs.data()}
                    if(initialize!==null){
                        initialize={...initialize, followers}
                    }
                } else {
                    if(initialize!==null){
                        initialize={...initialize, followers: {}}
                    }
                }
            }).catch(()=>{
                if(initialize!==null){
                    initialize={...initialize, followers: {}}
                }
            })
        }).then(async()=>{
            // following
            const followersRef = doc(database, 'following', userID)
            await getDoc(followersRef).then((docs)=>{
                if(docs.exists()){
                    const following = {...docs.data()}
                    if(initialize!==null){
                        initialize={...initialize, following}
                    }
                } else {
                    if(initialize!==null){
                        initialize={...initialize, following: {}}
                    }
                }
            }).catch(()=>{
                if(initialize!==null){
                    initialize={...initialize, following: {}}
                }
            })
        }).then(async()=>{
            // likes
            const bubblesRef = doc(database, 'userLikes', userID)
            await getDoc(bubblesRef).then((docs)=>{
                if(docs.exists()){
                    const likes = [...docs.data().bubbles]
                    if(initialize!==null){
                        initialize={...initialize, likes}
                    }
                } else {
                    if(initialize!==null){
                        initialize={...initialize, likes: []}
                    }
                }
            }).catch(()=>{
                if(initialize!==null){
                    initialize={...initialize, likes: []}
                }
            })
        }).then(async()=>{
            // replies
            const bubblesRef = doc(database, 'userReplies', userID)
            await getDoc(bubblesRef).then((docs)=>{
                if(docs.exists()){
                    const replies = [...docs.data().bubbles]
                    if(initialize!==null){
                        initialize={...initialize, replies}
                    }
                } else {
                    if(initialize!==null){
                        initialize={...initialize, likes: []}
                    }
                }
            }).catch(()=>{
                if(initialize!==null){
                    initialize={...initialize, likes: []}
                }
            })
        }).then(async()=>{
            // shares
            const bubblesRef = doc(database, 'userShares', userID)
            await getDoc(bubblesRef).then((docs)=>{
                if(docs.exists()){
                    const shares = [...docs.data().bubbles]
                    if(initialize!==null){
                        initialize={...initialize, shares}
                    }
                } else {
                    if(initialize!==null){
                        initialize={...initialize, shares: []}
                    }
                }
            }).catch(()=>{
                if(initialize!==null){
                    initialize={...initialize, shares: []}
                }
            })
        }).then(async()=>{
            // audience
            if(startUp){
                const savedAudienceRef = doc(database, 'savedAudience', userID)
                await getDoc(savedAudienceRef).then((docs)=>{
                    if(docs.exists()){
                        const audience = {...docs.data()}
                        if(initialize!==null){
                            initialize={...initialize, audience}
                        }
                    } else {
                        if(initialize!==null){
                            initialize={...initialize, audience: {}}
                        }
                    }
                }).catch(()=>{
                    if(initialize!==null){
                        initialize={...initialize, audience: {}}
                    }
                })
            }
        }).then(async()=>{
            // feed
            if(startUp){
                const userFeedRef = doc(database, 'feeds', userID)
                await getDoc(userFeedRef).then((docs)=>{
                    if(docs.exists()){
                        const feed = [...docs.data().bubbles]
                        if(initialize!==null){
                            initialize = {...initialize, feed}
                        }
                    } else {
                        if(initialize!==null){
                            initialize = {...initialize, feed: []}
                        }
                    }
                }).catch(()=>{
                    if(initialize!==null){
                        initialize = {...initialize, feed: []}
                    }
                })
            }
        }).then(()=>{
            // setup result
            result.successful = true
            result.data = initialize
        }).catch(()=>{
            res.send({successful:false, message: 'Server error: User not found'})
        })
    } catch(e){
        result.successful = false
        result.message = "Failed to get user data, prease try again..."
    } finally {
        // console.log(result);
        res.send(result)
    }
}

module.exports = initializeBubble