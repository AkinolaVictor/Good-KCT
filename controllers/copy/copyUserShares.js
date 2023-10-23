const { doc, getDoc } = require("firebase/firestore");
const User = require("../../models/User");
const { database } = require("../../database/firebase");
const userShares = require("../../models/userShares");
const { default: axios } = require("axios");
const { baseUrl } = require("../../utils/utilsExport");

async function copyUserShares(req, res){
    await axios.post(baseUrl("user/getAllUsers")).then(async(response)=>{
        if(response.data.successful){
            let allUsers = [...response.data.users]
            for(let i=0; i<allUsers.length; i++){
                const currentUser = {...allUsers[i]}
                await axios.post(baseUrl("user/initializeUser"), {userID: currentUser.id, startUp: true}).then(async(response2)=>{
                    if(response2.data.successful){
                        const thisData = {...response2.data.data}
                        const bubbles = [...thisData.shares]
                        // console.log(bubbles);
                        const bubs = await userShares.findOne({userID: currentUser.id})
                        const num = i+1
                        const progress = (num/allUsers.length)*100
                        if(bubs === null){
                            const newUserBubbles = new userShares({userID: currentUser.id, bubbles})
                            await newUserBubbles.save().then(()=>{
                                console.log(`${progress}% new completed`);
                            }).catch(()=>{
                                console.log(`${progress}% new failed`);
                            })
                        } else {
                            await userShares.updateOne({userID: currentUser.id}, {bubbles}).then(()=>{
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
    console.log("share fully completed");
}

module.exports = copyUserShares