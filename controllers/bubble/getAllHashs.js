// const { getDocs, collection } = require('firebase/firestore');
// const { database } = require('../../database/firebase');
// const User = require('../../models/User');

async function getAllHashs(req, res){
    const {hashTags} = req.dbModels
    
    try {
        const getHashTags = await hashTags.findOne({title: "batch_1"}).lean()
        if(getHashTags){
            const {allHashs} = getHashTags
            const data = [...Object.values(allHashs)]
            res.send({successful: true, hashtags: data})
        } else {
            res.send({successful: false, data: [], message: "user list not found"})
        }
    } catch(e){
        res.send({successful: false})
    }
}

module.exports = getAllHashs