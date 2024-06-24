

function socketUserInfoWatch(models, socket, io){
    const userLikes = models.LikeModel
    const userFeeds = models.Feeds
    const {User, userShares, userReplies, Followers, userBubbles, Following, savedAudience} = models
    try{
        // USER
        const userDoc = User.watch([], {fullDocument: "updateLookup"})
        userDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const user = {...data.fullDocument}
                const userID = user.id
                // console.log(user.userInfo.fullname);
                
                !user.feed || delete user.feed
                !user.posts || delete user.posts
                !user.bubbles || delete user.bubbles
                !user.followers || delete user.followers
                !user.following || delete user.following
                !user.audience || delete user.audience
                !user.likes || delete user.likes
                !user.shares || delete user.shares
                !user.replies || delete user.replies

                io.emit(`userInfo-${userID}`, {
                    type: "user",
                    data: {...user}
                })

                io.emit(`user-${userID}`, {
                    type: "user",
                    data: {...user}
                })  
            }
        })

        // Likes
        const userLikesDoc = userLikes.watch([], {fullDocument: "updateLookup"})
        userLikesDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const userID = data.fullDocument.userID                                              
                const likes = [...data.fullDocument.bubbles]
                io.emit(`userInfo-${userID}`, {
                    type: "likes",
                    data: {likes}
                })

                // io.emit(`userLikes-${userID}`, {
                //     type: "likes",
                //     data: [...likes.bubbles]
                // })                
            }
        })

        // FEED
        const userFeedsDoc = userFeeds.watch([], {fullDocument: "updateLookup"})
        userFeedsDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const userID = data.fullDocument.userID                                              
                const feed = [...data.fullDocument.bubbles]

                // let posts = {}
                // for(let j=0; j<feed.length; j++){
                //     posts[feed[j].postID] = true
                // }

                io.emit(`userInfo-${userID}`, {
                    type: "feed",
                    data: {feed}
                })

                // io.emit(`userFeed-${userID}`, {
                //     type: "lfeed",
                //     data: feed
                // }) 
            }
        })
        
        // BUBBLES
        const bubbleDoc = userBubbles.watch([], {fullDocument: "updateLookup"})
        bubbleDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const userID = data.fullDocument.userID                                              
                const bubbles = [...data.fullDocument.bubbles]

                let posts = {}
                for(let j=0; j<bubbles.length; j++){
                    posts[bubbles[j].postID] = true
                }

                io.emit(`userInfo-${userID}`, {
                    type: "userBubbles",
                    data: {bubbles, posts}
                })

                // io.emit(`userBubbles-${userID}`, {
                //     type: "userBubbles",
                //     data: bubbles
                // })
            }
        })

        // SHARE
        const userSharesDoc = userShares.watch([], {fullDocument: "updateLookup"})
        userSharesDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const userID = data.fullDocument.userID                                              
                const shares = [...data.fullDocument.bubbles]

                io.emit(`userInfo-${userID}`, {
                    type: "shares",
                    data: {shares}
                })

                // io.emit(`userShares-${userID}`, {
                //     type: "shares",
                //     data: shares
                // })
            }
        })

        // REPLIES
        const userRepliesDoc = userReplies.watch([], {fullDocument: "updateLookup"})
        userRepliesDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const replies = [...data.fullDocument.bubbles]
                const userID = data.fullDocument.userID                                              

                io.emit(`userInfo-${userID}`, {
                    type: "replies",
                    data: {replies}
                })

                // io.emit(`userReplies-${userID}`, {
                //     type: "replies",
                //     data: replies
                // })
            }
        })

        // FOLLOWERS
        const followersDoc = Followers.watch([], {fullDocument: "updateLookup"})
        followersDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const followers = {...data.fullDocument.followers}
                const userID = data.fullDocument.userID                                              

                io.emit(`userInfo-${userID}`, {
                    type: "followers",
                    data: {followers}
                })

                io.emit(`userFollowers-${userID}`, {
                    type: "followers",
                    data: followers
                })
            }
        })

        // FOLLOWINGS
        const followingDoc = Following.watch([], {fullDocument: "updateLookup"})
        followingDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const following = {...data.fullDocument.following}
                const userID = data.fullDocument.userID                                              

                io.emit(`userInfo-${userID}`, {
                    type: "following",
                    data: {following}
                })

                io.emit(`userFollowing-${userID}`, {
                    type: "following",
                    data: following
                })
            }
        })

        // SAVED AUDIENCE
        const savedAudienceDoc = savedAudience.watch([], {fullDocument: "updateLookup"})
        savedAudienceDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const audience = {...data.fullDocument.audience}
                const userID = data.fullDocument.userID                                              

                io.emit(`userInfo-${userID}`, {
                    type: "audience",
                    data: {audience}
                })

                // io.emit(`userAudience-${userID}`, {
                //     type: "audience",
                //     data: audience
                // })
            }
        })
    } catch(e){
        console.log("there was an error while watching user details");
        console.log(e);
    }
}

module.exports = socketUserInfoWatch