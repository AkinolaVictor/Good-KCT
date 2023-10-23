const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
const {database} = require('../../database/firebase')

async function editAudience(req, res){
    const data = req.body.data
    const userID = req.body.userID

    // remove from audience
    const audienceRef = doc(database, 'savedAudience', userID)
    await getDoc(audienceRef).then(async(docsnap)=>{
        if(docsnap.exists()){
            const audience = {...docsnap.data()}
            audience[data.name] = data
            // update audience
            await updateDoc(audienceRef, {...audience})
        } else {
            res.send({successful: false, message: 'Audience not found'})
        }
    }).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        res.send({successful: false, message: 'An error occured from the server side'})
    })

    
}

module.exports = editAudience