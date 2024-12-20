// const User = require('../../models/User')
// const Feeds = require('../../models/Feeds')
// const userBubbles = require('../../models/userBubbles')
// const userReplies = require('../../models/userReplies')
// const userShares = require('../../models/userShares')
// const Followers = require('../../models/Followers')
// const Following = require('../../models/Following')
// const savedAudience = require('../../models/savedAudience')
// const allUser = require('../../models/allUser')
// const LikeModel = require('../../models/LikeModel')
// const notifications = require('../../models/notifications')

async function createNewUser(req, res){
  const {userKnowledgebase, reservedContents, User, allUser, notifications, userBubbles, retainedAudience, userCinema, cinemaFeeds, Followers, Following, userReplies, Feeds, userShares, savedAudience, LikeModel, followersFeeds} = req.dbModels
  
    const data = req.body.data

    try{
      const user = new User({...data})
      await user.save().then(async()=>{
        // feeds
        // const feeds = new Feeds({userID: data.id, bubbles: []})
        // await feeds.save()
        const thisFeed = await Feeds.findOne({userID: data.id})
        if(thisFeed === null){
          const feeds = new Feeds({userID: data.id, bubbles: []})
          await feeds.save()
        }

        // bubbles
        // const bubbles = new userBubbles({userID: data.id, bubbles: []})
        // await bubbles.save()
        const thisBubble = await userBubbles.findOne({userID: data.id})
        if(thisBubble === null){
          const bubbles = new userBubbles({userID: data.id, bubbles: []})
          await bubbles.save()
        }

        // user created cinema
        const thisUserCinema = await userCinema.findOne({userID: data.id})
        if(thisUserCinema === null){
          const cinema = new userCinema({userID: data.id, cinema: []})
          await cinema.save()
        }

        // user received cinema
        const thisCinemaFeed = await cinemaFeeds.findOne({userID: data.id})
        if(thisCinemaFeed === null){
          const cinemaFeed = new cinemaFeeds({userID: data.id, cinema: []})
          await cinemaFeed.save()
        }

        // likes
        // const likes = new LikeModel({userID: data.id, bubbles: []})
        // await likes.save()
        const thisLike = await LikeModel.findOne({userID: data.id})
        if(thisLike === null){
          const likes = new LikeModel({userID: data.id, bubbles: []})
          await likes.save()
        }

        // replies
        // const replies = new userReplies({userID: data.id, bubbles: []})
        // await replies.save()
        const thisReplys = await userReplies.findOne({userID: data.id})
        if(thisReplys === null){
          const replies = new userReplies({userID: data.id, bubbles: []})
          await replies.save()
        }


        // shares
        // const shares = new userShares({userID: data.id, bubbles: []})
        // await shares.save()
        const thisShares = await userShares.findOne({userID: data.id})
        if(thisShares === null){
          const shares = new userShares({userID: data.id, bubbles: []})
          await shares.save()
        }

        // followers 
        // const followers = new Followers({userID: data.id, followers: {}})
        // await followers.save()
        const thisFollowers = await Followers.findOne({userID: data.id})
        if(thisFollowers === null){
          const followers = new Followers({userID: data.id, followers: {}})
          await followers.save()
        }

        // following
        // const following = new Following({userID: data.id, following: {}})
        // await following.save()
        const thisFollowing = await Following.findOne({userID: data.id})
        if(thisFollowing === null){
          const following = new Following({userID: data.id, following: {}})
          await following.save()
        }

        // saved audience
        // const audience = new savedAudience({userID: data.id, audience: {}})
        // await audience.save()
        const thisAudience = await savedAudience.findOne({userID: data.id})
        if(thisAudience === null){
          const audience = new savedAudience({userID: data.id, audience: {}})
          await audience.save()
        }
                
        // notification
        // const notification = new notifications({userID: data.id, all: []})
        // await notification.save()
        const thisNotification = await notifications.findOne({userID: data.id})
        if(thisNotification === null){
          const notification = new notifications({userID: data.id, all: []})
          await notification.save()
        }
        
        // userKnowledgebase, reservedContents
        const thisUserKnowledgebase = await userKnowledgebase.findOne({userID: data.id})
        if(thisUserKnowledgebase === null){
          const proto = {hashTags: {}, kpi: {}, userID: data.id}
          const thisKnowledge = new userKnowledgebase({...proto})
          await thisKnowledge.save()
        }
        
        // userKnowledgebase, reservedContents
        const thisReservedContents = await reservedContents.findOne({userID: data.id})
        if(thisReservedContents === null){
          const proto = {bubbles: [], cinema: [], userID: data.id}
          const thisKnowledge = new reservedContents({...proto})
          await thisKnowledge.save()
        }
        
        // userKnowledgebase, reservedContents
        const thisRetainedAudience = await retainedAudience.findOne({userID: data.id})
        if(thisRetainedAudience === null){
          const proto = {userID: data.id, audience: {}}
          const thisRetainedAudience = new retainedAudience({...proto})
          await thisRetainedAudience.save()
        }
        
        // userKnowledgebase, reservedContents
        const thisFollowersFeeds = await followersFeeds.findOne({userID: data.id})
        if(thisFollowersFeeds === null){
          const proto = {userID: data.id, cinema: [], bubbles: []}
          const thisFollowersFeeds = new followersFeeds({...proto})
          await thisFollowersFeeds.save()
        }
        

        // REGISTER USER (USED FOR UPDATES LIKE USERNAME AND THE OTHERS)
        const getAllUsers = await allUser.findOne({name: "concealed"}).lean()
        if(getAllUsers){

          getAllUsers.users[data.id] = {
            userID: data.id,
            fullname: data.userInfo.fullname,
            username: data.userInfo.username
          }

          await allUser.updateOne({name: "concealed"}, { users: getAllUsers.users })

        } else {
          const newUser = new allUser({
            name: "concealed",
            users: {
              [data.id]: {
                userID: data.id,
                fullname: data.userInfo.fullname,
                username: data.userInfo.username
              }
            }
          })
          await newUser.save()
        }

        
      }).then(()=>{
        res.send({successful: true})
        console.log("done");
      }).catch(()=>{
        res.send({successful: false})
        console.log("falied 1");
      })
    } catch (e){
      console.log("falied 2");
      res.send({successful: false})
    }
    
}

module.exports = createNewUser