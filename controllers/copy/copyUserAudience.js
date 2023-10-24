const { default: axios } = require("axios")
const { baseUrl } = require("../../utils/utilsExport")
const savedAudience = require("../../models/savedAudience")

async function copyUserAudience(){
    
    await axios.post(baseUrl("user/getAllUsers")).then(async(response)=>{
        if(response.data.successful){
            let allUsers = [...response.data.users]
            for(let i=0; i<allUsers.length; i++){
            // for(let i=0; i<5; i++){
                const currentUser = {...allUsers[i]}
                await axios.post(baseUrl("user/initializeUser"), {userID: currentUser.id, startUp: true}).then(async(response)=>{
                    if(response.data.successful){
                        const thisData = {...response.data.data}
                        const audience = {...thisData.audience}
                        // const audience = {...thisData.audience.audience}
                        // console.log(audience);
                        const bubs = await savedAudience.findOne({userID: currentUser.id})
                        const num = i+1
                        const progress = (num/allUsers.length)*100
                        if(bubs === null){
                            const newUserBubbles = new savedAudience({userID: currentUser.id, audience})
                            await newUserBubbles.save().then(()=>{
                                console.log(`${progress}% new completed`);
                            }).catch(()=>{
                                console.log(`${progress}% new failed`);
                            })
                        } else {
                            await savedAudience.updateOne({userID: currentUser.id}, {audience}).then(()=>{
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
    console.log("fully copied audience");
}

module.exports = copyUserAudience