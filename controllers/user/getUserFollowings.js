
const {doc, getDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function getUserFollowings(req, res){
    let userID = req.body.userID

    try{
        const userFollowing = await Following.findOne({userID}).lean()
        if(userFollowing){
            res.send({successful: true, following: userFollowing.following})
        } else {
            res.send({successful: false, message: 'followings not found'})
        }
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to get bubbles'})
    }
}

module.exports = getUserFollowings
