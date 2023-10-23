const {doc, getDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function getUsers(req, res){
    let users = [...req.body.users]
    // console.log(users);
    try{
        if(users.length===1){
            const userRef = doc(database, 'users', users[0])
            await getDoc(userRef).then((docSnap)=>{
                if(docSnap.exists()){
                    let thisUser = {...docSnap.data()}
                    thisUser.hide = false
                    res.send({successful: true, users: thisUser, count: 1})
                } else {
                    res.send({successful: false, message: 'User not found'})
                }
            }).catch(()=>{
                res.send({successful:false, message: 'Server error: User not found'})
            })

        } else {

            const savedUsers = []
            for(let i=0; i<users.length; i++){
                const thisPerson = users[i]
                const followerRef = doc(database, 'users', thisPerson)
                await getDoc(followerRef).then((docSnap)=>{
                    if(docSnap.exists()){
                        let thisUser = {...docSnap.data()}
                        thisUser.hide = false
                        savedUsers.push(thisUser)
                    }
                }).then(()=>{
                    if(i===users.length-1){
                        res.send({successful: true, users: savedUsers, count: users.length})
                    }
                }).catch(()=>{
                    res.send({successful:false})
                })
            }
        }
    } catch(e){
        res.send({successful: false, message: 'Server error: unable to get users'})
    }
}

module.exports = getUsers