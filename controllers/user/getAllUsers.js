// const { getDocs, collection } = require('firebase/firestore');
// const { database } = require('../../database/firebase');
// const User = require('../../models/User');

async function getAllUsers(req, res){
    const {User} = req.dbModels
    
    try {
        const getUsers = await User.find({}).lean()
        const arr = []
        for(let i=0; i<getUsers.length; i++){
            const each = {...getUsers[i]}
            each.hide = false
            arr.push(each)
        }
        res.send({successful: true, users: [...arr]})
    } catch(e){
        res.send({successful: false})
    }
}

module.exports = getAllUsers