const { default: axios } = require("axios")
const { baseUrl } = require("../../utils/utilsExport")
const Followers = require("../../models/Followers")

async function copyUserFollowers(){

    await axios.post(baseUrl("user/getAllUsers")).then(async(response)=>{
        if(response.data.successful){
            let allUsers = [...response.data.users]
            for(let i=0; i<allUsers.length; i++){
            // for(let i=0; i<3; i++){
                const currentUser = {...allUsers[i]}
                await axios.post(baseUrl("user/initializeUser"), {userID: currentUser.id, startUp: true}).then(async(response)=>{
                    if(response.data.successful){
                        const thisData = {...response.data.data}
                        let followers = {...thisData.followers}
                        // let followers = {...thisData.followers.followers}
                        const bubs = await Followers.findOne({userID: currentUser.id})
                        const num = i+1
                        const progress = (num/allUsers.length)*100
                        // console.log(Object.keys(followers).length);
                        if(bubs === null){
                            const newUserBubbles = new Followers({userID: currentUser.id, followers})
                            await newUserBubbles.save().then(()=>{
                                console.log(`${progress}% new completed`);
                            }).catch(()=>{
                                console.log(`${progress}% new failed`);
                            })
                        } else {
                            await Followers.updateOne({userID: currentUser.id}, {followers}).then(()=>{
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
    console.log("fully copied followers");
}

module.exports = copyUserFollowers