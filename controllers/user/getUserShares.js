// const {doc, getDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const userShares = require('../../models/userShares')

async function getUserShares(req, res){
    const {userShares} = req.dbModels

    let userID = req.body.userID

    try{
        const thisShare = await userShares.findOne({userID})
        if(thisShare){
            res.send({successful: true, bubbles: thisShare.bubbles})
        } else {
            res.send({successful: false, message: 'bubbles not found'})
        }
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to get bubbles'})
    }
}

module.exports = getUserShares