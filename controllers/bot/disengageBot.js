const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function disengageBot(req, res){
    const userID = req.body.userID
    const botID = req.body.botID
    const postID = req.body.postID
    // const taskID = req.body.taskID

    // const userRef = doc(database, 'users', userID)
    const userRef = doc(database, 'bubbles', postID)
    await getDoc(userRef).then(async(docsnap)=>{
        if(docsnap.exists()){
            const post = {...docsnap.data()}
            const allBots = post.settings.botData
            if(allBots[botID]){
                const botRef = doc(database, 'bots', botID)
                await getDoc(botRef).then(async(docsnap)=>{
                    const bot = {...docsnap.data()}
                    const data = [...docsnap.data().data]
                    for(let i=0; i<data.length; i++){
                        if(data[i]===postID){
                            data.splice(i, 1)
                        }
                    }
                    await updateDoc(botRef, {data}).then(async()=>{
                        delete post.settings.botData[botID]
                        const settings = post.settings
                        await updateDoc(userRef, {settings})
                        bot.data = data
                        res.send({successful: true, bot: bot})
                    })
                })
            }
        }
    }).catch(()=>{
        res.send({successful:false, message: 'Server Error: failed to disengage bot'})
    })
}

module.exports = disengageBot