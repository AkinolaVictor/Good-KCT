const {doc, getDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function getUserFollowers(req, res){
    let userID = req.body.userID

    try{
        const followersRef = doc(database, 'followers', userID)
        await getDoc(followersRef).then((docs)=>{
            if(docs.exists()){
                const followers =  {...docs.data()}
                res.send({successful: true, followers})
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

module.exports = getUserFollowers