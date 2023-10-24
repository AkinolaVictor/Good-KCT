// const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
// const date = require('date-and-time')
// const {database} = require('../../database/firebase')
// const savedAudience = require('../../models/savedAudience')

async function addAudience(req, res){
    const data = req.body.data
    const userID = req.body.userID
    const {savedAudience} = req.dbModels
    // remove from audience

    try {
        const audience = await savedAudience.findOne({userID}).lean()
        if(audience === null){
            const newAudience = new savedAudience({userID, audience: {[data.name]: data}})
            await newAudience.save().then(()=>{
                res.send({successful: true})
            }).catch(()=>{
                res.send({successful: false, message: 'Unable to save chnges'})
            })
        } else {
            if(audience.audience[data.name]){
                res.send({successful: false, message: 'Audience name already selected'})
            } else {
                audience.audience[data.name] = data
                await savedAudience.updateOne({userID}, {audience: {...audience.audience}}).then(()=>{
                // await audience.save().then(()=>{
                    res.send({successful: true})
                }).catch(()=>{
                    res.send({successful: false, message: 'Unable to save changes'})
                })
            }
        }
    } catch(e){
        res.send({successful: false, message: 'An error occured from the server side 2'})
    }
}

module.exports = addAudience