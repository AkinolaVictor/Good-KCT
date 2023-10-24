// const {doc, getDoc, updateDoc, getDocs, collection, setDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const User = require('../../models/User')
// const chats = require('../../models/chats')

async function setupChat(req, res){
    let userID = req.body.userID // user.id
    let followerID = req.body.followerID //item.id
    const {User, chats} = req.dbModels

    const generatedID = `${userID}-${followerID}`
    const generatedID2 = `${followerID}-${userID}`
    const chatData = {
        messages: [],
    }
    // let chatData = req.body.chatData //[...data.chats]
    // console.log(users);
    
        
    async function addToMyChats(genID){
        const userInfo = await User.findOne({id: userID})
        if(userInfo){
            const user1Info = {
                chatID: genID,
                recipient: followerID,
                index: userInfo.chats.length
            }

            const allChatId = []
            for(let j=0; j<userInfo.chats.length; j++){
                allChatId.push(userInfo.chats[j].recipient)
            }

            if(!allChatId.includes(followerID)){
                userInfo.chats.push(user1Info)
                // await userInfo.save()
                await User.updateOne({id: userID}, {chats: [...userInfo.chats]})
            }
        }
    }

    async function addToUserChats(genID){
        const userInfo = await User.findOne({id: followerID})
        if(userInfo){
            const user2Info = {
                chatID: genID,
                recipient: userID,
                index: userInfo.chats.length,
                // status: ''
            }

            const allChatId = []
            for(let j=0; j<userInfo.chats.length; j++){
                allChatId.push(userInfo.chats[j].recipient)
            }

            if(!allChatId.includes(userID)){
                userInfo.chats.push(user2Info)
                // await userInfo.save()
                await User.updateOne({id: followerID}, {chats: [...userInfo.chats]})
            }
        }
    }

    try{
        const testChat1 = await chats.findOne({chatID: generatedID}).lean()
        if(testChat1===null){
            const testChat2 = await chats.findOne({chatID: generatedID2}).lean()
            if(testChat2 === null){
                const newChat = new chats({chatID: generatedID, messages: []})
                await newChat.save().then(async()=>{
                    await addToMyChats(generatedID)
                    await addToUserChats(generatedID)
                    res.send({successful: true, newSetup: true})
                }).catch(()=>{
                    res.send({successful: false, message: "Unable to setup chat"})
                })
            } else {
                await addToMyChats(generatedID2)
                await addToUserChats(generatedID2)
                res.send({successful: true, newSetup: false})
            }
        } else {
            await addToMyChats(generatedID)
            await addToUserChats(generatedID)
            res.send({successful: true, newSetup: false})
        }
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to get users'})
    }
}

module.exports = setupChat