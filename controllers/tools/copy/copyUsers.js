const { collection, getDocs } = require("firebase/firestore");
const { database } = require("../../database/firebase");
const User = require("../../models/User");
const Feeds = require("../../models/Feeds");
const userBubbles = require("../../models/userBubbles");
const LikeModel = require("../../models/LikeModel");
const userReplies = require("../../models/userReplies");
const userShares = require("../../models/userShares");
const Followers = require("../../models/Followers");
const Following = require("../../models/Following");
const savedAudience = require("../../models/savedAudience");
const allUser = require("../../models/allUser");
const { default: axios } = require("axios");
const { baseUrl } = require("../../utils/utilsExport");
const notifications = require("../../models/notifications");

async function copyUser(req, res){
    await axios.post(baseUrl("user/getAllUsers")).then(async(response)=>{
        if(response.data.successful){
            let allUsernames = [...response.data.users]
            console.log(allUsernames.length, "total users");
            for(let i=0; i<allUsernames.length; i++){
                const thisUser = await User.findOne({id: allUsernames[i].id}).lean()
                if(thisUser === null){
                    const userData = {...allUsernames[i]}
                    delete userData.updatedAt
                    delete userData.createdAt
                    delete userData.hide
                    
                    const newUser = new User({...userData})
                    await newUser.save().then(async()=>{
                        // feeds
                        const thisFeed = await Feeds.findOne({userID: allUsernames[i].id})
                        if(thisFeed === null){
                          const feeds = new Feeds({userID: allUsernames[i].id, bubbles: []})
                          await feeds.save()
                        }
                
                        // bubbles
                        const thisBubble = await userBubbles.findOne({userID: allUsernames[i].id})
                        if(thisBubble === null){
                          const bubbles = new userBubbles({userID: allUsernames[i].id, bubbles: []})
                          await bubbles.save()
                        }
                
                        // likes
                        const thisLike = await LikeModel.findOne({userID: allUsernames[i].id})
                        if(thisLike === null){
                          const likes = new LikeModel({userID: allUsernames[i].id, bubbles: []})
                          await likes.save()
                        }
                
                        // replies
                        const thisReplys = await userReplies.findOne({userID: allUsernames[i].id})
                        if(thisReplys === null){
                          const replies = new userReplies({userID: allUsernames[i].id, bubbles: []})
                          await replies.save()
                        }
                
                        // shares
                        const thisShares = await userShares.findOne({userID: allUsernames[i].id})
                        if(thisShares === null){
                          const shares = new userShares({userID: allUsernames[i].id, bubbles: []})
                          await shares.save()
                        }
                
                        // followers 
                        const thisFollowers = await Followers.findOne({userID: allUsernames[i].id})
                        if(thisFollowers === null){
                          const followers = new Followers({userID: allUsernames[i].id, followers: {}})
                          await followers.save()
                        }
                
                        // following
                        const thisFollowing = await Following.findOne({userID: allUsernames[i].id})
                        if(thisFollowing === null){
                          const following = new Following({userID: allUsernames[i].id, following: {}})
                          await following.save()
                        }
                
                        // notification
                        const thisNotification = await notifications.findOne({userID: allUsernames[i].id})
                        if(thisNotification === null){
                          const notification = new notifications({userID: allUsernames[i].id, all: []})
                          await notification.save()
                        }
                
                        // saved audience
                        const thisAudience = await savedAudience.findOne({userID: allUsernames[i].id})
                        if(thisAudience === null){
                          const audience = new savedAudience({userID: allUsernames[i].id, audience: {}})
                          await audience.save()
                        }
    
                        // REGISTER USER (USED FOR UPDATES LIKE USERNAME AND THE OTHERS)
                        const getAllUsers = await allUser.findOne({name: "concealed"}).lean()
                        if(getAllUsers){
                          getAllUsers.users[allUsernames[i].id] = {
                              userID: allUsernames[i].id,
                              fullname: allUsernames[i].userInfo.fullname,
                              username: allUsernames[i].userInfo.username
                          }
                          await allUser.updateOne({name: "concealed"}, { users: getAllUsers.users})
                        } else {
                          const newUser = new allUser({
                            name: "concealed",
                            users: {
                              [allUsernames[i].id]: {
                                userID: allUsernames[i].id,
                                fullname: allUsernames[i].userInfo.fullname,
                                username: allUsernames[i].userInfo.username
                              }
                            }
                          })
                          newUser.save()
                        }
    
    
    
                        const num = i+1
                        const progress = (num/allUsernames.length)*100
                        console.log(`${progress}% completed`);
                    }).catch((err)=>{
                        console.log("failed", err);
                    })
    
                }
            }
            console.log("fully completed");
        }
    }).catch(()=>{
        console.log("failed");
    })


    // const firebaseUsers = collection(database, "users")
    // await getDocs(firebaseUsers).then(async (users)=>{
    //     let allUsernames = []
    //     for(let i=0; i<users.docs.length; i++){
    //         const each = {...users.docs[i].data()}
    //         allUsernames.push(each)
    //     }
        
    //     for(let i=0; i<allUsernames.length; i++){
    //         const thisUser = await User.findOne({id: allUsernames[i].id}).lean()
    //         if(thisUser === null){
    //             const userData = {...allUsernames[i]}
    //             delete userData.updatedAt
    //             delete userData.createdAt
    //             const newUser = new User({...userData})
    //             await newUser.save().then(async()=>{
    //                 // feeds
    //                 const feeds = new Feeds({userID: allUsernames[i].id, bubbles: []})
    //                 await feeds.save()
            
    //                 // bubbles
    //                 const bubbles = new userBubbles({userID: allUsernames[i].id, bubbles: []})
    //                 await bubbles.save()
            
    //                 // likes
    //                 const likes = new LikeModel({userID: allUsernames[i].id, bubbles: []})
    //                 await likes.save()
            
    //                 // replies
    //                 const replies = new userReplies({userID: allUsernames[i].id, bubbles: []})
    //                 await replies.save()
            
    //                 // shares
    //                 const shares = new userShares({userID: allUsernames[i].id, bubbles: []})
    //                 await shares.save()
            
    //                 // followers 
    //                 const followers = new Followers({userID: allUsernames[i].id, followers: {}})
    //                 await followers.save()
            
    //                 // following
    //                 const following = new Following({userID: allUsernames[i].id, following: {}})
    //                 await following.save()
            
    //                 // saved audience
    //                 const audience = new savedAudience({userID: allUsernames[i].id, audience: {}})
    //                 await audience.save()

    //                 // REGISTER USER (USED FOR UPDATES LIKE USERNAME AND THE OTHERS)
    //                 const getAllUsers = await allUser.findOne({name: "concealed"}).lean()
    //                 if(getAllUsers){
    //                   getAllUsers.users[allUsernames[i].id] = {
    //                       userID: allUsernames[i].id,
    //                       fullname: allUsernames[i].userInfo.fullname,
    //                       username: allUsernames[i].userInfo.username
    //                   }
    //                   await allUser.updateOne({name: "concealed"}, { users: getAllUsers.users})
    //                 } else {
    //                   const newUser = new allUser({
    //                     name: "concealed",
    //                     users: {
    //                       [allUsernames[i].id]: {
    //                         userID: allUsernames[i].id,
    //                         fullname: allUsernames[i].userInfo.fullname,
    //                         username: allUsernames[i].userInfo.username
    //                       }
    //                     }
    //                   })
    //                   newUser.save()
    //                 }



    //                 const num = i+1
    //                 const progress = (num/allUsernames.length)*100
    //                 console.log(`${progress}% completed`);
    //             }).catch((err)=>{
    //                 console.log("failed", err);
    //             })

    //         }
    //     }
    //     console.log("fully completed");
    //     // res.send({allUsernames})
    // }).catch(()=>{
    //     console.log("failed2");
    // })
}

module.exports = copyUser