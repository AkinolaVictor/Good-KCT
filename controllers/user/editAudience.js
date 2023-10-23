const {doc, getDoc, updateDoc, setDoc} = require('firebase/firestore')
// const {getDownloadURL, ref, uploadBytes} = require('firebase/storage')
const date = require('date-and-time')
const {database} = require('../../database/firebase')
const savedAudience = require('../../models/savedAudience')

async function editAudience(req, res){
    const data = req.body.data
    const userID = req.body.userID

    // remove from audience
    try {
        const audienceRef = await savedAudience.findOne({userID}).lean()
        if(audienceRef){
            audienceRef.audience[data.name] = data
            await savedAudience.updateOne({userID}, {audience: {...audienceRef.audience}}).then(()=>{
            // await audienceRef.save().then(()=>{
                res.send({successful: true})
            }).catch(()=>{
                res.send({successful: false, message: 'Audience not saved'})
            })
            // update audience
        } else {
            res.send({successful: false, message: 'Audience not found'})
        }
    } catch (e){
        res.send({successful: false, message: 'An error occured from the server side'})
    }
}

module.exports = editAudience