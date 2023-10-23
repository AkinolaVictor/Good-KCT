const { default: axios } = require("axios")
const { baseUrl } = require("../../utils/utilsExport")
const usageAnalyticsModel = require("../../models/usageAnalytics")

async function copyUsageAnalytics(){
    await axios.post(baseUrl("user/getAllUsers")).then(async(response)=>{
        if(response.data.successful){
            const allUsers = [...response.data.users]
            // console.log(allUsers.length);
            for(let i=0; i<allUsers.length; i++){
                const currentUser = {...allUsers[i]}
                await axios.post(baseUrl("user/getUsageAnalytics"), {userID: currentUser.id}).then(async(response2)=>{
                    // console.log(response2.data);
                    if(response2.data.successful){
                        const analytics = {...response2.data.analytics}
                        const num = i+1
                        const progress = (num/allUsers.length)*100
                        const push = await usageAnalyticsModel.findOne({userID: currentUser.id})
                        if(push === null){
                            const newPush = new usageAnalyticsModel({userID: currentUser.id, analytics}) 
                            await newPush.save().then(()=>{
                                console.log(`${progress}% new completed`);
                            }).catch(()=>{
                                console.log(`${progress}% new failed`);
                            })
                        } else {
                            await usageAnalyticsModel.updateOne({userID: currentUser.id}, {analytics}).then(()=>{
                                console.log(`${progress}% completed`);
                            }).catch(()=>{
                                console.log(`${progress}% failed`);
                            })
                        }
                    }
                }).catch(()=>{
                    console.log("undone");
                })

            }
            console.log("fully completed");
        }
    }).catch((err)=>{
        console.log(err);
        console.log("failed");
    })
}

module.exports = copyUsageAnalytics