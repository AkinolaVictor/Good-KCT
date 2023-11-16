const { default: axios } = require("axios")
const { baseUrl } = require("../../utils/utilsExport")
const Following = require("../../models/Following")

async function copyUserFollowings(){

    await axios.post(baseUrl("user/getAllUsers")).then(async(response)=>{
        if(response.data.successful){
            let allUsers = [...response.data.users]
            for(let i=0; i<allUsers.length; i++){
                const currentUser = {...allUsers[i]}
                await axios.post(baseUrl("user/initializeUser"), {userID: currentUser.id, startUp: true}).then(async(response)=>{
                    if(response.data.successful){
                        const thisData = {...response.data.data}
                        const following = {...thisData.following}
                        // const following = {...thisData.following.following}
                        const bubs = await Following.findOne({userID: currentUser.id})
                        const num = i+1
                        const progress = (num/allUsers.length)*100
                        // console.log(following);
                        if(bubs === null){
                            const newUserBubbles = new Following({userID: currentUser.id, following})
                            await newUserBubbles.save().then(()=>{
                                console.log(`${progress}% new completed`);
                            }).catch(()=>{
                                console.log(`${progress}% new failed`);
                            })
                        } else {
                            await Following.updateOne({userID: currentUser.id}, {following}).then(()=>{
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
    console.log("fully copied following");
}

module.exports = copyUserFollowings