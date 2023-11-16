const { doc, getDoc } = require("firebase/firestore");
const User = require("../../models/User");
const { database } = require("../../database/firebase");
const Feeds = require("../../models/Feeds");
const { default: axios } = require("axios");
const { baseUrl } = require("../../utils/utilsExport");

async function copyUserFeed(req, res){

    await axios.post(baseUrl("user/getAllUsers")).then(async(response)=>{
        if(response.data.successful){
            let allUsers = [...response.data.users]
            for(let i=0; i<allUsers.length; i++){
                const currentUser = {...allUsers[i]}
                await axios.post(baseUrl("user/initializeUser"), {userID: currentUser.id, startUp: true}).then(async(response)=>{
                    if(response.data.successful){
                        const thisData = {...response.data.data}
                        const bubbles = [...thisData.feed]
                        // console.log(bubbles);
                        const bubs = await Feeds.findOne({userID: currentUser.id})
                        const num = i+1
                        const progress = (num/allUsers.length)*100
                        if(bubs === null){
                            const newUserBubbles = new Feeds({userID: currentUser.id, bubbles})
                            await newUserBubbles.save().then(()=>{
                                console.log(`${progress}% new completed`);
                            }).catch(()=>{
                                console.log(`${progress}% new failed`);
                            })
                        } else {
                            await Feeds.updateOne({userID: currentUser.id}, {bubbles}).then(()=>{
                                console.log(`${progress}% completed`);
                            }).catch(()=>{
                                console.log(`${progress}% failed`);
                            })
                        }
                    } else {
                        console.log("failedss");
                    }
                }).catch(()=>{
                    console.log("failed to initialize");
                })
            }
        }
    }).catch(()=>{
        console.log("failed to get users");
    })
    
    console.log("feeds fully completed");

}

module.exports = copyUserFeed