const { default: axios } = require("axios")
const { baseUrl } = require("../../utils/utilsExport")
const savePush = require("../../models/savePush")

async function copySavedSubscription (){
    await axios.post(baseUrl("user/getAllUsers")).then(async(response)=>{
        if(response.data.successful){
            const allUsers = [...response.data.users]
            // console.log(allUsers.length);
            for(let i=0; i<allUsers.length; i++){
                const currentUser = {...allUsers[i]}
                await axios.post(baseUrl("user/getUserPushNotification"), {userID: currentUser.id}).then(async(response2)=>{
                    if(response2.data.successful){
                        const subscription = response2.data.subscription
                        const num = i+1
                        const progress = (num/allUsers.length)*100
                        const push = await savePush.findOne({userID: currentUser.id})
                        if(push === null){
                            const newPush = new savePush({userID: currentUser.id, subscription}) 
                            await newPush.save().then(()=>{
                                console.log(`${progress}% new completed`);
                            }).catch(()=>{
                                console.log(`${progress}% new failed`);
                            })
                        } else {
                            await savePush.updateOne({userID: currentUser.id}, {subscription}).then(()=>{
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

module.exports = copySavedSubscription