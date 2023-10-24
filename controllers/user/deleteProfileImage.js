// const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {storage} = require('../../database/firebase')
const { ref, deleteObject } = require('firebase/storage')
// const User = require('../../models/User')

async function deleteProfileImages(req, res){
    const whichPhoto = req.body.whichPhoto
    const userID = req.body.userID
    const {User} = req.dbModels
    
    const fileRef = ref(storage,  `users/${userID}/profile/${whichPhoto}`);
    await deleteObject(fileRef).then(async()=>{
        await User.updateOne({id: userID}, {[`${whichPhoto==='profile-photo'?'profilePhotoUrl':'coverPhotoUrl'}`]: ""})
        res.send({successful: true})
    }).catch((err)=>{
        res.send({successful: false, message: "Some error was encountered, unable to delete file"})
    })
}

module.exports = deleteProfileImages