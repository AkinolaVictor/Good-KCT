const {doc, getDoc, updateDoc, deleteDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function deleteBot(req, res){
    const userID = req.body.userID
    const id = req.body.id
    const botPosts = [...req.body.botPosts]

    const userRef = doc(database, 'users', userID)
    await getDoc(userRef).then(async(snapShot)=>{
        const data = snapShot.data()
        const bots = [...data.bots]

        for(let i=0; i<bots.length; i++){
            if(bots[i] === id){
                bots.splice(i, 1)
            }
        }

        // you must detatch bot from all posts its engaged in before deleting it
        for(let i=0; i<botPosts.length; i++){
            const bubbleRef = doc(database, 'bubbles', botPosts[i])
            await getDoc(bubbleRef).then((docsnap)=>{
                if(docsnap.exists()){
                    const post = {...docsnap.data()}
                    if(post.settings.botData[id]){
                        delete post.settings.botData[id]
                        const settings = post.settings
                        updateDoc(bubbleRef, {settings})
                    }
                }
            })
        }

        await updateDoc(userRef, {bots})

        await deleteDoc(doc(database, "bots", id))
    }).then(()=>{
        res.send({successful:true})
    }).catch(()=>{
        res.send({successful:false})
    })
}

module.exports = deleteBot