const {doc, getDoc, updateDoc, getDocs, collection} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function updateUserProfile(req, res){
    const userID = req.body.userID
    const which = req.body.which
    const datum = req.body.datum
    const generalModalProp = req.body.generalModalProp


    try{
        const docz = doc(database, 'users', userID) 
        await getDoc(docz).then(async(docSnap)=>{
            let userInfo = {...docSnap.data().userInfo}
            userInfo[which] = datum
            if(generalModalProp==='username'){
                const usersRef = collection(database, 'users')
                let response={
                    successful: false,
                    message: 'Unknown error'
                }
                await getDocs(usersRef).then(async(res)=>{
                    let allUsernames = []
                    for(let i=0; i<res.docs.length; i++){
                        const each = {...res.docs[i].data()}
                        allUsernames.push(each.userInfo.username)
                    }
                    if(allUsernames.includes(datum)){
                        response = {successful: false, message: 'Username is already chosen'}
                        // res.send({successful: false, message: 'Username is already chosen'})
                    } else {
                        await updateDoc(docz, {userInfo}).then(()=>{
                            // res.send({successful: true})
                            response= {successful: true}
                        }).catch(()=>{
                            response = {successful: false, message: 'Failed to update user from server'}
                            // res.send({successful: false, message: 'Failed to update user from server'})
                        })
                    }
                    // allUsernames = null
                }).then(()=>{
                    res.send(response)
                }).catch(()=>{
                    res.send(response)
                })
            } else {
                await updateDoc(docz, {userInfo}).then(()=>{
                    res.send({successful: true})
                }).catch(()=>{
                    // alertFlash(genID, 'profileInfo', 'An error occured')
                    res.send({successful: false, message: 'An error occured when updating profile'})
                    return
                })
            }
        }).catch(()=>{
            res.send({successful: true, message: 'Error from the server, unable to get user.'})
        })
    } catch(e){
        res.send({successful: false, message: 'A network error occured at the server'})
    }
}

module.exports = updateUserProfile