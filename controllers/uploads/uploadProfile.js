const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { storage } = require("../../database/firebase");

module.exports = async function uploadProfile(req, res){
    if(!req.file) return

    const {originalname} = req.file
    const userID = originalname
    console.log(originalname);
    
    
    res.send({successful: true})
}