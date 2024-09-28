// const User = require('../../models/User')
// const userBubbles = require('../../models/userBubbles')
// const Followers = require('../../models/Followers')
// const Following = require('../../models/Following')
// const userReplies = require('../../models/userReplies')
// const userShares = require('../../models/userShares')
// const savedAudience = require('../../models/savedAudience')
// const Feeds = require('../../models/Feeds')
// const LikeModel = require('../../models/LikeModel')

async function initializeUser(req, res){
    const {User, userBubbles, Followers, Following, userReplies, Feeds, cinemaFeeds, userShares, userCinema, savedAudience, LikeModel} = req.dbModels
    
    let userID = req.body.userID
    const startUp = req.body.startUp
    // console.log(req.dbModels);
    
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
        // console.log(data);

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
            const cins = allUserLikes.cinema||[]
            const cinemalikes = [...cins]
            data.likes = likes
            data.cinemalikes = cinemalikes
        } else {
            data.likes = []
            data.cinemalikes = []
        }

        // GET REPLIES
        const allUserReplies = await userReplies.findOne({userID}).lean()
        if(allUserReplies){
            const bubblereplies = [...allUserReplies.bubbles]
            const cins = allUserReplies.cinema||[]
            const cinemareplies = [...cins]
            data.replies = bubblereplies
            data.cinemareplies = cinemareplies
        } else {
            data.replies = []
            data.cinemareplies = []
        }

        // GET SHARES
        const allUserShares = await userShares.findOne({userID}).lean()
        if(allUserShares){
            const bubbleshares = [...allUserShares.bubbles]
            const cins = allUserShares.cinema||[]
            const cinemashares = [...cins]
            data.shares = bubbleshares
            data.cinemashares = cinemashares
        } else {
            data.shares = []
            data.cinemashares = []
        }

        // GET CINEMA
        const allUserCinema = await userCinema.findOne({userID}).lean()
        if(allUserCinema){
            const cinema = [...allUserCinema.cinema]
            data.cinema = cinema
        } else {
            data.cinema = []
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

            const userCinFeeds = await cinemaFeeds.findOne({userID}).lean()
            if(userCinFeeds){
                const cins = userCinFeeds.cinema||[]
                const cinfeed = [...cins]
                data.cinemafeed = cinfeed
            } else {
                data.cinemafeed = []
            }
        }
        res.send({successful: true, data})

    } else {
        res.send({successful:false, data: null, message: 'Server error: error encountered from the server when trying to get user, please try to reload this page. If problem persists, user data was not found.'})
    }
}

module.exports = initializeUser