const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {database} = require('../../database/firebase')

async function changeProfileImages(req, res){
    const url = req.body.url
    const whichPhoto = req.body.whichPhoto
    const userID = req.body.userID

    const docz = doc(database, 'users', userID)
    await updateDoc(docz, {[`${whichPhoto==='cover-photo'?'coverPhotoUrl':'profilePhotoUrl'}`]: url}).then(()=>{
        res.send({successful: true})
    }).catch(()=>{
        res.send({successful: false, message: 'Upload failed when updating url'})
    })
}

module.exports = changeProfileImages