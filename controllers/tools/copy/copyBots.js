const { default: axios } = require("axios")
const { baseUrl } = require("../../utils/utilsExport")
const bot = require("../../models/bot")

async function copyBots(){
    
    await axios.post(baseUrl("user/getAllUsers")).then(async(response)=>{
        if(response.data.successful){
            let allUsers = [...response.data.users]
            for(let i=0; i<allUsers.length; i++){
                const currentUser = {...allUsers[i]}
                const userBots = [...currentUser.bots]
                if(userBots.length){
                    // console.log(userBots);
                    await axios.post(baseUrl("bot/getAllBots"), {userBots}).then(async(response2)=>{
                        // console.log(response2.data);
                        if(response2.data.successful){
                            const allBots = [...response2.data.bots]
                            // console.log(allBots);
                            const num = i+1
                            const progress = (num/allUsers.length)*100
                            for(let j=0; j<allBots.length; j++){
                                const thisBot = allBots[j]
                                // console.log({thisBot});
                                // console.log(data);
                                const bubs = await bot.findOne({id: thisBot.id})
                                if(bubs === null){
                                    const newChat = new bot({...thisBot})
                                    await newChat.save().then(()=>{
                                        console.log(`${progress}% new completed`);
                                    }).catch(()=>{
                                        console.log(`${progress}% new failed`);
                                    })
                                } else {
                                    await bot.updateOne({id: thisBot.id}, {...thisBot}).then(()=>{
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
        }
    }).catch(()=>{
        console.log("failed to get users");
    })
}

module.exports = copyBots