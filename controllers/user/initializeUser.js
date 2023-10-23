const User = require('../../models/User')
const userBubbles = require('../../models/userBubbles')
const Followers = require('../../models/Followers')
const Following = require('../../models/Following')
// const userLikes = require('../../models/userLikes.JS')
const userReplies = require('../../models/userReplies')
const userShares = require('../../models/userShares')
const savedAudience = require('../../models/savedAudience')
const Feeds = require('../../models/Feeds')
const LikeModel = require('../../models/LikeModel')

async function initializeUser(req, res){
    let userID = req.body.userID
    const startUp = req.body.startUp
    
    let user = await User.findOne({id: userID}).lean()
    let data = {}
    if(user){
        data = {...user}
        // GET BUBBLES
        const allUserBubbles = await userBubbles.findOne({userID}).lean()
        if(allUserBubbles){
            const bubbles = [...allUserBubbles.bubbles]
            let postsData = {}
            for(let j=0; j<bubbles.length; j++){
                if(typeof bubbles[j] === "object"){
                    if(bubbles[j].postID){
                        postsData[bubbles[j].postID] = true
                    }
                }
            }
            data.bubbles = bubbles
            data.posts = postsData
        } else {
            data.bubbles = []
            data.posts = {}
        }

        // GET FOLLOWERS
        const userFollowers = await Followers.findOne({userID}).lean()
        if(userFollowers){
            const followers =  {...userFollowers.followers}
            data.followers = followers
        } else {
            data.followers = {}
        }

        // GET FOLLOWING
        const userFollowing = await Following.findOne({userID}).lean()
        if(userFollowing){
            const following =  {...userFollowing.following}
            data.following = following
        } else {
            data.following = {}
        }

        // GET LIKES
        // const allUserLikes = await userLikes.findOne({userID}).lean()
        const allUserLikes = await LikeModel.findOne({userID}).lean()
        if(allUserLikes){
            const likes = [...allUserLikes.bubbles]
            data.likes = likes
        } else {
            data.likes = []
        }

        // GET REPLIES
        const allUserReplies = await userReplies.findOne({userID}).lean()
        if(allUserReplies){
            const replies = [...allUserReplies.bubbles]
            data.replies = replies
        } else {
            data.replies = []
        }

        // GET SHARES
        const allUserShares = await userShares.findOne({userID}).lean()
        if(allUserShares){
            const shares = [...allUserShares.bubbles]
            data.shares = shares
        } else {
            data.shares = []
        }
        
        // GET SAVED AUDIENCE
        if(startUp){
            const userSavedAudience = await savedAudience.findOne({userID}).lean()
            if(userSavedAudience){
                const audience = {...userSavedAudience.audience}
                data.audience = audience
            } else {
                data.audience = {}
            }

            const userFeeds = await Feeds.findOne({userID}).lean()
            if(userFeeds){
                const feed = [...userFeeds.bubbles]
                data.feed = feed
            } else {
                data.feed = []
            }
        }
        res.send({successful: true, data})

    } else {
        res.send({successful:false, data: null, message: 'Server error: error encountered from the server when trying to get user, please try to reload this page. If problem persists, user data was not found.'})
    }
}

module.exports = initializeUser