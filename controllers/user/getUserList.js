// const { getDocs, collection } = require('firebase/firestore');
// const { database } = require('../../database/firebase');
// const User = require('../../models/User');

async function getUserList(req, res){
    const {allUser} = req.dbModels
    // const onlyWithUsername = req.body.onlyWithUsername
    
    try {
        const getUsers = await allUser.findOne({name: "concealed"}).lean()
        if(getUsers){
            const {users} = getUsers
            const data = [...Object.values(users)]
            
            res.send({successful: true, users: data})
        } else {
            res.send({successful: false, data: [], message: "user list not found"})
        }
    } catch(e){
        res.send({successful: false})
    }
}

module.exports = getUserList