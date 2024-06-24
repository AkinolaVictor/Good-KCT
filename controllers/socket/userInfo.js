// userInfo
const { doc, onSnapshot } = require("firebase/firestore");
const { database } = require("../../database/firebase");


const subscriptions = {
    user: {},
    feed: {},
    bubbles: {},
    followers: {},
    following: {},
    audience: {},
    likes: {},
    shares: {},
    replies: {}
}

function userInfo(socket, io){
    socket.on("userInfo", (data)=>{
        const userID = data.userID
        const focus = [...data.focus]

        if(userID){
            subscribeToUserInfo()
        }

        function access(name){
            if(focus.includes("all")){
                return true
            } else if(focus.includes(name)){
                return true
            } else {
                return false
            }
        }


        async function subscribeToUserInfo(){
            
            // USER
            if(access("user")){
                if(!subscriptions.user[userID]){
                    const docRef = doc(database, 'users', userID)
                    onSnapshot(docRef, (userData)=>{
                        const user = {...userData.data()}
                        // allData = {...allData, ...user}
                        
                        // delete all data that are to be fetched
                        !user.feed || delete user.feed
                        !user.posts || delete user.posts
                        !user.bubbles || delete user.bubbles
                        !user.followers || delete user.followers
                        !user.following || delete user.following
                        !user.audience || delete user.audience
                        !user.likes || delete user.likes
                        !user.shares || delete user.shares
                        !user.replies || delete user.replies
        
                        subscriptions.user[userID] = true
                        io.emit(`userInfo-${userID}`, {
                            type: "user",
                            data: {...user}
                        })
                    })
                }
            }


            // FEED
            if(access("feed")){
                if(!subscriptions.feed[userID]){
                    const userFeedRef = doc(database, 'feeds', userID)
                    onSnapshot(userFeedRef, (feedData)=>{
                        if(feedData.exists()){
                            const feed = [...feedData.data().bubbles]
                            subscriptions.feed[userID] = true
                            io.emit(`userInfo-${userID}`, {
                                type: "feed",
                                data: {feed}
                            })
                        }
                    })
                }
            }


            // BUBBLES
            if(access("bubbles")){
                if(!subscriptions.bubbles[userID]){
                    const userBubbleRef = doc(database, 'userBubbles', userID)
                    onSnapshot(userBubbleRef, (bubbleData)=>{
                        if(bubbleData.exists()){
                            const bubbles = [...bubbleData.data().bubbles]
                            // allData.bubbles = bubbles
                            let postsData = {}
                            for(let j=0; j<bubbles.length; j++){
                                postsData[bubbles[j].postID] = true
                            }
                            subscriptions.bubbles[userID] = true
                            io.emit(`userInfo-${userID}`, {
                                type: "bubbles",
                                data: {bubbles, posts: postsData}
                            })
                        }
                    })
                }
            }


            // FOLLOWERS
            if(access("followers")){
                if(!subscriptions.followers[userID]){
                    const followersRef = doc(database, 'followers', userID)
                    onSnapshot(followersRef, (followersData)=>{
                        if(followersData.exists()){
                            const followers = {...followersData.data()}
                            subscriptions.followers[userID] = true
                            io.emit(`userInfo-${userID}`, {
                                type: "followers",
                                data: {followers}
                            })
                        }
                    })
                }
            }


            // FOLLOWING
            if(access("following")){
                if(!subscriptions.following[userID]){
                    const followingRef = doc(database, 'following', userID)
                    onSnapshot(followingRef, (followingData)=>{
                        if(followingData.exists()){
                            const following = {...followingData.data()}
                            subscriptions.following[userID] = true
                            io.emit(`userInfo-${userID}`, {
                                type: "following",
                                data: {following}
                            })
                        }
                    })
                }
            }


            // AUDIENCE
            if(access("audience")){
                if(!subscriptions.audience[userID]){
                    const savedAudienceRef = doc(database, 'savedAudience', userID)
                    onSnapshot(savedAudienceRef, (audienceData)=>{
                        if(audienceData.exists()){
                            const audience = {...audienceData.data()}
                            subscriptions.audience[userID] = true
                            io.emit(`userInfo-${userID}`, {
                                type: "audience",
                                data: {audience}
                            })
                        }
                    })
                }
            }


            // LIKES
            if(access("likes")){
                if(!subscriptions.likes[userID]){
                    const userLikesRef = doc(database, 'userLikes', userID)
                    onSnapshot(userLikesRef, (likesData)=>{
                        if(likesData.exists()){
                            const likes = [...likesData.data().bubbles]
                            subscriptions.likes[userID] = true
                            io.emit(`userInfo-${userID}`, {
                                type: "likes",
                                data: {likes}
                            })
                        }
                    })
                }
            }


            // SHARES
            if(access("shares")){
                if(!subscriptions.shares[userID]){
                    const userSharesRef = doc(database, 'userShares', userID)
                    onSnapshot(userSharesRef, (sharesData)=>{
                        if(sharesData.exists()){
                            const shares = [...sharesData.data().bubbles]
                            subscriptions.shares[userID] = true
                            io.emit(`userInfo-${userID}`, {
                                type: "shares",
                                data: {shares}
                            })
                        }
                    })
                }
            }

            // REPLIES
            if(access("replies")){
                if(!subscriptions.replies[userID]){
                    const userRepliesRef = doc(database, 'userReplies', userID)
                    onSnapshot(userRepliesRef, (repliesData)=>{
                        if(repliesData.exists()){
                            const replies = [...repliesData.data().bubbles]
                            subscriptions.replies[userID]=true
                            io.emit(`userInfo-${userID}`, {
                                type: "replies",
                                data: {replies}
                            })
                        }
                    })
                }
            }
        }
    })
}

module.exports = userInfo