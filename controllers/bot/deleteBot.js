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
        const posts = {...data.posts}

        for(let i=0; i<bots.length; i++){
            if(bots[i] === id){
                bots.splice(i, 1)
            }
        }

        // you must detatch bot from all posts its engaged in before deleting it
        for(let i=0; i<botPosts.length; i++){
            if(posts[botPosts[i]]){
                if(posts[botPosts[i]].settings.botData[id]){
                    delete posts[botPosts[i]].settings.botData[id]
                }
            }
        }

        await updateDoc(userRef, {bots, posts})

        await deleteDoc(doc(database, "bots", id))
        res.send({successful:true})
    }).catch(()=>{
        res.send({successful:false})
    })
}

module.exports = deleteBot