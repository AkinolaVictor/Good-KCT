const { getDocs, collection } = require('firebase/firestore');
const { database } = require('../../database/firebase');

async function getAllUsers(req, res){
    
    const usersRef = collection(database, 'users')
    await getDocs(usersRef).then((docsnap)=>{
        const arr = []
        for(let i=0; i<docsnap.docs.length; i++){
            const each = {...docsnap.docs[i].data()}
            each.hide=false
            arr.push(each)
        }
        res.send({successful: true, users: [...arr]})
    }).catch((err)=>{
        res.send({successful: false})
    })
}

module.exports = getAllUsers