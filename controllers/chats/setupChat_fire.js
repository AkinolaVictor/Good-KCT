const {doc, getDoc, updateDoc, getDocs, collection, setDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function setupChat(req, res){
    let userID = req.body.userID // user.id
    let followerID = req.body.followerID //item.id

    const generatedID = `${userID}-${followerID}`
    const generatedID2 = `${followerID}-${userID}`
    const chatData = {
        messages: [],
    }
    // let chatData = req.body.chatData //[...data.chats]
    // console.log(users);
    
        
    async function addToMyChats(genID){
        const docz = doc(database, 'users', userID)
        await getDoc(docz).then(async (docu)=>{
            const data = {...docu.data()}
            const chats = [...data.chats]

            const user1Info = {
                chatID: genID,
                recipient: followerID,
                index: chats.length
            }

            const allChatId = []
            for(let j=0; j<chats.length; j++){
                allChatId.push(chats[j].recipient)
            }

            if(!allChatId.includes(followerID)){
                chats.push(user1Info)
                await updateDoc(docz, {chats})
            }
        })
    }

    async function addToUserChats(genID){
        const user2 = doc(database, 'users', followerID)
        await getDoc(user2).then(async (document)=>{
            const data = {...document.data()}
            const chats = [...data.chats]

            const user2Info = {
                chatID: genID,
                recipient: userID,
                index: chats.length,
                // status: ''
            }

            const allChatId = []
            for(let j=0; j<chats.length; j++){
                allChatId.push(chats[j].recipient)
            }

            if(!allChatId.includes(userID)){
                chats.push(user2Info)
                await updateDoc(user2, {chats})
            }
        })
    }

    try{
        const chatsRef = collection(database, 'chats')
        
        await getDocs(chatsRef).then(async(snapshot)=>{
            const arr = []
            for(let i=0; i<snapshot.docs.length; i++){
                arr.push(snapshot.docs[i].id)
            }
            if(arr.includes(generatedID)){
                addToMyChats(generatedID)
                addToUserChats(generatedID)
                res.send({successful: true, newSetup: false})
            } else if(arr.includes(generatedID2)){
                addToMyChats(generatedID2)
                addToUserChats(generatedID2)
                res.send({successful: true, newSetup: false})
            } else {
                await setDoc(doc(database, "chats", generatedID), {...chatData}).then(async()=>{
                    addToMyChats(generatedID)
                    addToUserChats(generatedID)
                    res.send({successful: true, newSetup: true})
                })
            }
        }).catch(()=>{
            res.send({successful: false, message: 'Server error: unable to get users'})
        })
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to get users'})
    }
}

module.exports = setupChat