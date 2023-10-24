const {doc, getDoc, updateDoc, setDoc, deleteField} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
// const date = require('date-and-time')
// const {database} = require('../../database/firebase')
// const savedAudience = require('../../models/savedAudience')

async function deleteAudience(req, res){
    const data = req.body.data
    const userID = req.body.userID
    const {savedAudience} = req.dbModels

    // remove from audience
    try {
        const audience = await savedAudience.findOne({userID}).lean()
        if(audience){
            if(audience.audience[data.name]){
                delete audience.audience[data.name]
                await savedAudience.updateOne({userID}, {audience: {...audience.audience}}).then(()=>{
                // await audience.save().then(()=>{
                    res.send({successful: true})
                }).catch(()=>{
                    res.send({successful: false, message: 'audience not saved'})
                })
            } else {
                res.send({successful: false, message: 'audience not found'})
            }
        } else {
            res.send({successful: false, message: 'user audience not found'})
        }

    } catch(e){
        res.send({successful: false, message: 'An error occured from the server side'})
    }
    
}

module.exports = deleteAudience