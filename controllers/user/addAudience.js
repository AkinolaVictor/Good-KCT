const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
const {database} = require('../../database/firebase')

async function addAudience(req, res){
    const data = req.body.data
    const userID = req.body.userID
    // remove from audience
    const audienceRef = doc(database, 'savedAudience', userID)
    await getDoc(audienceRef).then(async(docsnap)=>{
        if(docsnap.exists()){
            let audience = {...docsnap.data()}
            audience[data.name] = data
            // update audience
            await updateDoc(audienceRef, {...audience})
        } else {
            setDoc(audienceRef, {[data.name]: data})
        }
    }).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        res.send({successful: false, message: 'An error occured from the server side'})
    })

    
}

module.exports = addAudience