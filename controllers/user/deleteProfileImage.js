const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {database, storage} = require('../../database/firebase')
const { ref, deleteObject } = require('firebase/storage')

async function deleteProfileImages(req, res){
    const whichPhoto = req.body.whichPhoto
    const userID = req.body.userID
    

    const fileRef = ref(storage,  `users/${userID}/profile/${whichPhoto}`);
    await deleteObject(fileRef).then(async()=>{
        const docz = doc(database, 'users', userID)
        await updateDoc(docz, {[`${whichPhoto==='profile-photo'?'profilePhotoUrl':'coverPhotoUrl'}`]: ''}).then(()=>{
            res.send({successful: true})
        }).catch(()=>{
            res.send({successful: false, message: "Some error was encountered, unable to update file after delete"})
        })
    }).catch((err)=>{
        res.send({successful: false, message: "Some error was encountered, unable to delete file"})
    })
}

module.exports = deleteProfileImages