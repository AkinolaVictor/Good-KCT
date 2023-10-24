// const {doc, getDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const userReplies = require('../../models/userReplies')

async function getUserReplies(req, res){
    const {userReplies} = req.dbModels
    
    let userID = req.body.userID

    try{
        const replies = await userReplies.findOne({userID}).lean()
        if(replies === null){
            res.send({successful: false, message: "replied bubbles"})
        } else {
            res.send({successful: true, bubbles: replies.bubbles})
        }
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to get bubbles'})
    }
}

module.exports = getUserReplies