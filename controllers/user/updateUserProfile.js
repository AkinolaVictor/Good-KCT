const {doc, getDoc, updateDoc, getDocs, collection} = require('firebase/firestore')
const {database} = require('../../database/firebase')
const User = require('../../models/User')
const allUser = require('../../models/allUser')

async function updateUserProfile(req, res){
    const userID = req.body.userID
    const which = req.body.which
    const datum = req.body.datum
    const generalModalProp = req.body.generalModalProp


    try{
        const user = await User.findOne({id: userID}).lean()

        if(!user){
            res.send({successful: false, message: 'User data not found'})
            return 
        }

        user.userInfo[which] = datum


        // update username
        if(generalModalProp==='username'){
            const getAllUsers = await allUser.findOne({name: "concealed"}).lean()
            if(getAllUsers){
                const usersArr = [...Object.values(getAllUsers.users)]
                for(let i=0; i<usersArr.length; i++){
                    const currentUsername = usersArr[i].username.toLowerCase()
                    const newUsernamename = datum.toLowerCase()
                    if(currentUsername === newUsernamename){
                        res.send({successful: false, message: 'Username is already chosen'})
                        return
                    }
                }
                if(!getAllUsers.users[userID]){
                    getAllUsers.users[userID] = {
                        userID,
                        fullname: user.userInfo.fullname,
                        username: datum
                    }
                } else {
                    getAllUsers.users[userID].username = datum
                }
                await allUser.updateOne({name: "concealed"}, { users: getAllUsers.users })
                
            } else {
                const newUser = new allUser({
                    name: "concealed",
                    users: {
                        [userID]: {
                            userID,
                            fullname: user.userInfo.fullname,
                            username: datum
                        }
                    }
                })
                newUser.save()
            }
        }

        await User.updateOne({id: userID}, { userInfo: user.userInfo }).then(()=>{
            res.send({successful: true})
        }).catch(()=>{
            res.send({successful: false, message: 'Unable to save user data'})
        })
    } catch(e){
        res.send({successful: false, message: 'A network error occured at the server'})
    }
}

module.exports = updateUserProfile