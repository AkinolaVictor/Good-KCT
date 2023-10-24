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
  const {User, allUser, notifications, userBubbles, Followers, Following, userReplies, Feeds, userShares, savedAudience, LikeModel} = req.dbModels
  
    const data = req.body.data

    try{
      const user = new User({...data})
      await user.save().then(async()=>{
        // feeds
        // const feeds = new Feeds({userID: data.id, bubbles: []})
        // await feeds.save()
        const thisFeed = await Feeds.findOne({userID: allUsernames[i].id})
        if(thisFeed === null){
          const feeds = new Feeds({userID: allUsernames[i].id, bubbles: []})
          await feeds.save()
        }

        // bubbles
        // const bubbles = new userBubbles({userID: data.id, bubbles: []})
        // await bubbles.save()
        const thisBubble = await userBubbles.findOne({userID: allUsernames[i].id})
        if(thisBubble === null){
          const bubbles = new userBubbles({userID: allUsernames[i].id, bubbles: []})
          await bubbles.save()
        }

        // likes
        // const likes = new LikeModel({userID: data.id, bubbles: []})
        // await likes.save()
        const thisLike = await LikeModel.findOne({userID: allUsernames[i].id})
        if(thisLike === null){
          const likes = new LikeModel({userID: allUsernames[i].id, bubbles: []})
          await likes.save()
        }

        // replies
        // const replies = new userReplies({userID: data.id, bubbles: []})
        // await replies.save()
        const thisReplys = await userReplies.findOne({userID: allUsernames[i].id})
        if(thisReplys === null){
          const replies = new userReplies({userID: allUsernames[i].id, bubbles: []})
          await replies.save()
        }


        // shares
        // const shares = new userShares({userID: data.id, bubbles: []})
        // await shares.save()
        const thisShares = await userShares.findOne({userID: allUsernames[i].id})
        if(thisShares === null){
          const shares = new userShares({userID: allUsernames[i].id, bubbles: []})
          await shares.save()
        }

        // followers 
        // const followers = new Followers({userID: data.id, followers: {}})
        // await followers.save()
        const thisFollowers = await Followers.findOne({userID: allUsernames[i].id})
        if(thisFollowers === null){
          const followers = new Followers({userID: allUsernames[i].id, followers: {}})
          await followers.save()
        }

        // following
        // const following = new Following({userID: data.id, following: {}})
        // await following.save()
        const thisFollowing = await Following.findOne({userID: allUsernames[i].id})
        if(thisFollowing === null){
          const following = new Following({userID: allUsernames[i].id, following: {}})
          await following.save()
        }

        // saved audience
        // const audience = new savedAudience({userID: data.id, audience: {}})
        // await audience.save()
        const thisAudience = await savedAudience.findOne({userID: allUsernames[i].id})
        if(thisAudience === null){
          const audience = new savedAudience({userID: allUsernames[i].id, audience: {}})
          await audience.save()
        }
                
        // notification
        // const notification = new notifications({userID: data.id, all: []})
        // await notification.save()
        const thisNotification = await notifications.findOne({userID: allUsernames[i].id})
        if(thisNotification === null){
          const notification = new notifications({userID: allUsernames[i].id, all: []})
          await notification.save()
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
          newUser.save()
        }

        
      }).then(()=>{
        res.send({successful: true})
      }).catch(()=>{
        res.send({successful: false})
      })
    } catch (e){
      res.send({successful: false})
    }
    
}

module.exports = createNewUser