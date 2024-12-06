async function updateLocation(req, res) {
    const {userID, location} = req.body
    const models = req.dbModels
    const {User} = models

    const thisUser = await User.findOne({id: userID}).lean()
    if(thisUser){
        const userInfo = thisUser.userInfo
        userInfo.location = location
        await User.updateOne({id: userID}, {userInfo})
    }

    res.send({successful: true})
}

module.exports = updateLocation