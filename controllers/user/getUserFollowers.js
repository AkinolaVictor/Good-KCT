const {doc, getDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')
const Followers = require('../../models/Followers')

async function getUserFollowers(req, res){
    let userID = req.body.userID

    try{
        const userFollowers = await Followers.find({userID}).lean()
        if(userFollowers){
            res.send({successful: true, followers: userFollowers.followers})
        } else {
            res.send({successful: false, message: 'followers not found'})
        }
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to get bubbles'})
    }
}

module.exports = getUserFollowers