// const {doc, getDoc, updateDoc, getDocs, collection} = require('firebase/firestore')
// const {database} = require('../../database/firebase')
// const User = require('../../models/User')
// const allUser = require('../../models/allUser')

async function updateUserInterests(req, res){
    const {User} = req.dbModels
    
    const userID = req.body.userID
    const interests = req.body.interests


    try{
        // console.log({interests});
        // res.send({successful: false, message: 'User data not found'})
        // return
        const user = await User.findOne({id: userID}).lean()

        if(!user){
            res.send({successful: false, message: 'User data not found'})
            return
        }

        const interestsArr = Object.keys(interests)||[]
        user.interests = interestsArr
        await User.updateOne({id: userID}, { interests: user.interests }).then(()=>{
            res.send({successful: true})
        }).catch((e)=>{
            console.log(e);
            res.send({successful: false, message: 'Unable to save user data'})
        })
    } catch(e){
        console.log(e);
        res.send({successful: false, message: 'A network error occured at the server'})
    }
}

module.exports = updateUserInterests