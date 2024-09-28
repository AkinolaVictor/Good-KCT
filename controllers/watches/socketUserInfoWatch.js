

function socketUserInfoWatch(models, socket, io){
    const userLikes = models.LikeModel
    const userFeeds = models.Feeds
    const {User, userShares, userReplies, Followers, userBubbles, Following, savedAudience, cinemaFeeds, userCinema} = models
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
                const cinemalikes = data.fullDocument?.cinema||[]
                io.emit(`userInfo-${userID}`, {
                    type: "likes",
                    data: {likes, cinemalikes}
                })                
            }
        })

        // FEED
        const userFeedsDoc = userFeeds.watch([], {fullDocument: "updateLookup"})
        userFeedsDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const userID = data.fullDocument.userID                                              
                const feed = [...data.fullDocument.bubbles]

                io.emit(`userInfo-${userID}`, {
                    type: "feed",
                    data: {feed}
                })
            }
        })

        // CINEMAFEED
        const userCinemaFeedsDoc = cinemaFeeds.watch([], {fullDocument: "updateLookup"})
        userCinemaFeedsDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const userID = data.fullDocument.userID                                              
                const cinemafeed = [...data.fullDocument.cinema]

                io.emit(`userInfo-${userID}`, {
                    type: "cinemafeed",
                    data: {cinemafeed}
                })
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
        
        // CINEMA
        const cinemaDoc = userCinema.watch([], {fullDocument: "updateLookup"})
        cinemaDoc.on("change", async(data)=>{
            if(data.fullDocument){
                const userID = data.fullDocument.userID                                              
                const cinema = [...data.fullDocument.cinema]

                let cinemaposts = {}
                for(let j=0; j<cinema.length; j++){
                    cinemaposts[cinema[j].postID] = true
                }

                io.emit(`userInfo-${userID}`, {
                    type: "userCinema",
                    data: {cinema, cinemaposts}
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
                const cinemashares = data.fullDocument?.cinema||[]

                io.emit(`userInfo-${userID}`, {
                    type: "shares",
                    data: {shares, cinemashares}
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
                const userID = data.fullDocument.userID                                              
                const replies = [...data.fullDocument.bubbles]
                const cinemareplies = data.fullDocument?.cinema?[...data.fullDocument.cinema]:[]

                io.emit(`userInfo-${userID}`, {
                    type: "replies",
                    data: {replies, cinemareplies}
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