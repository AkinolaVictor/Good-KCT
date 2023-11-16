const { default: axios } = require("axios")
const chats = require("../../../models/chats")
const { baseUrl } = require("../../../utils/utilsExport")

async function organizeFollowers(){

    await axios.post(baseUrl("user/getAllUsers")).then(async(response)=>{
        if(response.data.successful){
            let allUsers = [...response.data.users]
            for(let i=0; i<allUsers.length; i++){
                // console.log("got here");
                const currentUser = {...allUsers[i]}
                await axios.post(baseUrl("user/organizeFollowing"), {userID: currentUser.id}).then(async(response)=>{
                // await axios.post(baseUrl("user/organizeFollowers"), {userID: "nHrDLGQXonQE7Uw2B2qKBhHb1rj1"}).then(async(response)=>{
                    const num = i+1
                    const progress = (num/allUsers.length)*100
                    if(response.data.successful){
                        console.log(`${progress}% new completed`);
                    } else {
                        console.log(`${progress}% new failed`);
                    }
                }).catch(()=>{
                    console.log("failed to initialize");
                })
            }
        }
    }).catch(()=>{
        console.log("failed to get users");
    })
}

module.exports = organizeFollowers