
const {doc, getDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function getUserFollowings(req, res){
    let userID = req.body.userID

    try{
        const followingRef = doc(database, 'following', userID)
        await getDoc(followingRef).then((docs)=>{
            if(docs.exists()){
                const following = {...docs.data()}
                res.send({successful: true, following})
            } else {
                res.send({successful: false, message: 'bubbles not found'})
            }
        }).catch(()=>{
            res.send({successful: false, message: 'Server error: bubbles not found'})

        })
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to get bubbles'})
    }
}

module.exports = getUserFollowings