const { default: axios } = require("axios")
const { baseUrl } = require("../../utils/utilsExport")
const botActivities = require("../../models/BotActivities")

async function copyBotActivities(){
    
    await axios.post(baseUrl("user/getAllUsers")).then(async(response)=>{
        if(response.data.successful){
            let allUsers = [...response.data.users]
            for(let i=0; i<allUsers.length; i++){
                const currentUser = {...allUsers[i]}
                await axios.post(baseUrl("user/getUserBotActivities"), {userID: currentUser.id}).then(async(response2)=>{
                    if(response2.data.successful){
                        const activities = {...response2.data.botActivities}
                        const activityArr = Object.keys(activities)
                        // console.log(activities);
                        if(activityArr.length){
                            const bubs = await botActivities.findOne({userID: currentUser.id})
                            const num = i+1
                            const progress = (num/allUsers.length)*100
                            if(bubs === null){
                                const newUserBubbles = new botActivities({userID: currentUser.id, ...activities})
                                await newUserBubbles.save().then(()=>{
                                    console.log(`${progress}% new completed`);
                                }).catch(()=>{
                                    console.log(`${progress}% new failed`);
                                })
                            } else {
                                await botActivities.updateOne({userID: currentUser.id}, {...activities}).then(()=>{
                                    console.log(`${progress}% completed`);
                                }).catch(()=>{
                                    console.log(`${progress}% failed`);
                                })
                            }
                        }
                        // console.log(`${progress}% progress`);
                    }
                }).catch(()=>{
                    console.log("failed to initialize");
                })
                // console.log("done");
            }
        }
    }).catch(()=>{
        console.log("failed to get users");
    })
    console.log("done");
}

module.exports = copyBotActivities