// const {doc, getDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const User = require('../../models/User')

async function getUsers(req, res){
    const {User} = req.dbModels
    
    let users = [...req.body.users]
    try{
        if(users.length===1){
            const user = await User.findOne({id: users[0]}).lean()
            if(user){
                res.send({successful: true, users: user, count: 1})
            } else {
                res.send({successful: false, message: 'User not found'})
            }
        } else {
            const requestedUsers = await User.find({id: {$in: [...users]}}).lean()
            if(requestedUsers){
                res.send({successful: true, users: requestedUsers, count: requestedUsers.length})
            } else {
                res.send({successful:false})
            }
        }
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to get users'})
    }
}

module.exports = getUsers