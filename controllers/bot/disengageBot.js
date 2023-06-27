const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function disengageBot(req, res){
    const userID = req.body.userID
    const botID = req.body.botID
    const postID = req.body.postID
    // const taskID = req.body.taskID

    const userRef = doc(database, 'users', userID)
    await getDoc(userRef).then(async(docsnap)=>{
        const posts = {...docsnap.data().posts}
        if(posts[postID]){
            const allBots = posts[postID].settings.botData
            if(allBots[botID]){
                const botRef = doc(database, 'bots', botID)
                await getDoc(botRef).then(async(docsnap)=>{
                    const data = [...docsnap.data().data]
                    for(let i=0; i<data.length; i++){
                        if(data[i]===postID){
                            data.splice(i, 1)
                        }
                    }
                    await updateDoc(botRef, {data}).then(()=>{
                        res.send({successful:true, bot: docsnap.data()})
                    }).catch(()=>{
                        res.send({successful:false})
                    })
                }).catch(()=>{
                    res.send({successful:false})
                })
                delete posts[postID].settings.botData[botID]

                await updateDoc(userRef, {posts}).catch(()=>{
                    res.send({successful:false})
                })
            }
        }
    }).catch(()=>{
        res.send({successful:false})
    })
}

module.exports = disengageBot