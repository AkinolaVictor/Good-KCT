// const {doc, getDoc, updateDoc} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const User = require('../../models/User')

async function changeProfileImages(req, res){
    const {User} = req.dbModels
    
    const url = req.body.url
    const whichPhoto = req.body.whichPhoto
    const userID = req.body.userID

    const thisUser = await User.findOne({id: userID})
    if(!thisUser){
        res.send({successful: false, message: 'Upload failed when updating url'})
        return
    }
    thisUser[`${whichPhoto==='cover-photo'?'coverPhotoUrl':'profilePhotoUrl'}`]= url
    // thisUser.save()
    await User.updateOne({id: userID}, {[`${whichPhoto==='cover-photo'?'coverPhotoUrl':'profilePhotoUrl'}`]: url})
    res.send({successful: true})
}

module.exports = changeProfileImages