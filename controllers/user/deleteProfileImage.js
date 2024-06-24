// const {doc, getDoc, updateDoc} = require('firebase/firestore')
const {storage} = require('../../database/firebase')
const { ref, deleteObject } = require('firebase/storage')
// const User = require('../../models/User')
// const User = require('../../public/images')
// const multer = require("multer")

async function deleteProfileImages(req, res){
    const {User} = req.dbModels
    
    const whichPhoto = req.body.whichPhoto
    const userID = req.body.userID

    // return
    
    const fileRef = ref(storage,  `users/${userID}/profile/${whichPhoto}`);
    await User.updateOne({id: userID}, {[`${whichPhoto==='profile-photo'?'profilePhotoUrl':'coverPhotoUrl'}`]: ""})
    // console.log("got here 0");
    await deleteObject(fileRef).then(async()=>{
        // console.log("got here 1");
        await User.updateOne({id: userID}, {[`${whichPhoto==='profile-photo'?'profilePhotoUrl':'coverPhotoUrl'}`]: ""})
        // console.log("got here 2");
        res.send({successful: true})
    }).catch((err)=>{
        // console.log("got here 3", err);
        res.send({successful: false, message: "Some error was encountered, unable to delete file"})
    })
}

module.exports = deleteProfileImages