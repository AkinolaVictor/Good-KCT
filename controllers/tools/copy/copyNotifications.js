const { default: axios } = require("axios")
const { baseUrl } = require("../../utils/utilsExport")
const notifications = require("../../models/notifications")

async function copyNotifications(){
    // console.log("notif begins");
    await axios.post(baseUrl("user/getAllUsers")).then(async(response)=>{
        if(response.data.successful){
            let allUsers = [...response.data.users]
            for(let i=0; i<allUsers.length; i++){
                const currentUser = {...allUsers[i]}
                await axios.post(baseUrl("user/getUserNotification"), {userID: currentUser.id}).then(async(response)=>{
                    if(response.data.successful){
                        const all = [...response.data.notifications]
                        const notif = await notifications.findOne({userID: currentUser.id})
                        const num = i+1
                        const progress = (num/allUsers.length)*100
                        if(notif === null){
                            const newUserBubbles = new notifications({userID: currentUser.id, all})
                            await newUserBubbles.save().then(()=>{
                                console.log(`${progress}% new completed`);
                            }).catch(()=>{
                                console.log(`${progress}% new failed`);
                            })
                        } else {
                            await notifications.updateOne({userID: currentUser.id}, {all}).then(()=>{
                                console.log(`${progress}% completed`);
                            }).catch(()=>{
                                console.log(`${progress}% failed`);
                            })
                        }
                    }
                }).catch(()=>{
                    console.log("failed to initialize");
                })
            }
        }
    }).catch(()=>{
        console.log("failed to get users");
    })
    console.log("fully copied notification");
}

module.exports = copyNotifications