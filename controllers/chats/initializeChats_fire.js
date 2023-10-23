const {doc, getDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function initializeChats(req, res){
    let chats = req.body.chats  // chats[i].recipient
    let allData = {}
    let success = false

    try{
        for(let i=0; i<chats.length; i++){
            const docz = doc(database, 'users', chats[i].recipient)
            await getDoc(docz).then(async(docu)=>{
                if(docu.exists()){
                    const user = {...docu.data()}
                    let item = {}
                    item.fullname = user.userInfo.fullname
                    item.username = user.userInfo.username
                    item.profilePhoto=user.profilePhotoUrl
                    item.hide=false
                    item.id = chats[i].recipient
                    item.chatID = chats[i].chatID
    
                    const userDocRef = doc(database, 'chats', chats[i].chatID)
                    await getDoc(userDocRef).then((snapshot)=>{
                        if(snapshot.exists()){
                            const chatData = {...snapshot.data()}
                            item.data={...chatData}
                            allData[chats[i].chatID] = item
                            success = true
                            item={}
                        }
                    })
                }
            })
        }
    } catch(e){
        // console.log('failed');
        success = false
    } finally {
        if(success){
            res.send({successful: true, allData})
        } else {
            res.send({successful: false, message: 'Server error: unable to get bubbles'})
        }
        // allData={}
    }
}

module.exports = initializeChats