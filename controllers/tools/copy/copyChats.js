const { default: axios } = require("axios")
const chats = require("../../models/chats")
const { baseUrl } = require("../../utils/utilsExport")

async function copyChats(){

    await axios.post(baseUrl("user/getAllUsers")).then(async(response)=>{
        if(response.data.successful){
            let allUsers = [...response.data.users]
            for(let i=0; i<allUsers.length; i++){
                const currentUser = {...allUsers[i]}
                const payload = {
                    chats: currentUser.chats
                }
                await axios.post(baseUrl("chats/initializeChats"), {...payload}).then(async(response)=>{
                    // console.log(response.data);
                    if(response.data.successful){
                        const allData = {...response.data.allData}
                        const allChats = [...Object.values(allData)]
                        const num = i+1
                        const progress = (num/allUsers.length)*100
                        for(let j=0; j<allChats.length; j++){
                            const data = allChats[j].data
                            // console.log(data);
                            const bubs = await chats.findOne({chatID: allChats[j].chatID})
                            if(bubs === null){
                                const newChat = new chats({chatID: allChats[j].chatID, messages: data.messages})
                                await newChat.save().then(()=>{
                                    console.log(`${progress}% new completed`);
                                }).catch(()=>{
                                    console.log(`${progress}% new failed`);
                                })
                            } else {
                                await chats.updateOne({chatID: allChats[j].chatID}, {messages: data.messages}).then(()=>{
                                    console.log(`${progress}% completed`);
                                }).catch(()=>{
                                    console.log(`${progress}% failed`);
                                })
                            }

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
}

module.exports = copyChats